const rabbitService = require("../serviceConfig/rabbitMq");

// С какой переодичность вызовем снова callback, если он вернул false
const throttleTimeout = 2 * 1000;

const consumers = {
    // Название vhost
    "/": {
        queues: {},
        exchanges: {}
    },
    "sending_letter": {
        queues: {
            "send-now-letter": {
                options: { durable: true, exclusive: false, noAck: false },
                callback: require("./sending_letter"),
                params: {}
            }
        },
        exchanges: {
            "send-delayed-message": {
                type: "x-delayed-message",
                options: { durable: true, arguments: {"x-delayed-type": "direct"} },
                routerKeys: {
                    "send-delayed-letter": {
                        options: { durable: true, exclusive: false, noAck: false },
                        callback: require("./sending_letter"),
                        params: {}
                    }
                }
            }
        }
    }
}

/*
Варианты получения ответа от callback:
0 - успешное выполнение
1 - ошибка процесса, отмена сообщения
2 - ошибка процесса, продолжить вызов callback
*/

const throttle = (callback, timeout) => {
    let timer = false;
    let lastResponse = {code: 2, data: "сообщение в процессе рассмотра."};
    return async function perform(...args) {
        if (timer || lastResponse.code === 0 || lastResponse.code === 1) {
            return lastResponse;
        }

        return new Promise((resolve, reject) => {
            timer = setTimeout(async () => {
                try {
                    lastResponse = await callback(...args);
                    clearTimeout(timer);
                    timer = false;
                    resolve(lastResponse);
                } catch (error) {
                    reject(error);
                }
            }, timeout);
        });
    }
}

// Метод для повторного вызова callback
const throttleRequests = async (data) => {
    const {callback, message, params} = data;

    const throttleCallback = throttle(callback, throttleTimeout);
    while(true) {
        const res = await throttleCallback(message, params);
        if(res.code === 0 || res.code === 1)
            break;
    }
}

const callAndAnswerCallback = async (data) => {
    const {channel, message, callback, params, noAck} = data;
    const resCallback = await callback(message, params);
    if(noAck) {return;}

    if(resCallback.code === 2) {
        await throttleRequests({callback, message, params});
    }
    await channel.ack(message);
}

const createRouterKeys = async (channel, exchangeName, routerKeys) => {
    if(!channel || !routerKeys) { return; }

    for(const [routeKey, routeData] of Object.entries(routerKeys)) {
        const {options = {}, callback, params = {}} = routeData;
        const {noAck = true, ...otherOptions} = options;

        if(!callback) {
            throw new Error("Не передана функции обработки сообщения.")
        }

        const { queue } = await channel.assertQueue(routeKey, otherOptions);
        await channel.bindQueue(queue, exchangeName, routeKey);

        await channel.consume(queue, async (message) => {
            await callAndAnswerCallback({channel, message, callback, params, noAck});
        }, { noAck: noAck });
    }
}

const createExchanges = async (channel, exchanges) => {
    if(!channel || !exchanges) { return; }

    for(const [exchangeName, exchangeData] of Object.entries(exchanges)) {
        const {type: exchangeType, routerKeys, options = {}} = exchangeData;
        await channel.assertExchange(exchangeName, exchangeType, options);
        await createRouterKeys(channel, exchangeName, routerKeys);
    }
}

const createQueues = async (channel, queues) => {
    if(!channel || !queues) { return; }

    for(const [queueName, routeData] of Object.entries(queues)) {
        const {options = {}, callback, params = {}} = routeData;
        const {noAck = true, ...otherOptions} = options;

        if(!callback) {
            throw new Error("Не передана функции обработки сообщения.")
        }

        await channel.assertQueue(queueName, otherOptions);
        await channel.consume(queueName, async (message) => {
            await callAndAnswerCallback({channel, message, callback, params, noAck});
        }, { noAck: noAck });
    }
}


const initConsumers = async (needVhost = "/") => {
    const vhostData = consumers[needVhost];
    if(!vhostData) {
        throw new Error(`Переданный vhost: ${needVhost} не был найден в конфигурации.`)
    }

    const {
        queues = {},
        exchanges = {}
    } = vhostData;

    try {
        const channel = await rabbitService.getAndCreateChannel(needVhost);
        await createQueues(channel, queues);
        await createExchanges(channel, exchanges);
    } catch(err) {
        throw new Error(`Произошла ошибка: ${err}`)
    }

    console.log(`Vhosts: ${needVhost} ready.`);
}

const VHOST = process.env.VHOST ? process.env.VHOST : "/";
(async () => {await initConsumers(VHOST);})();