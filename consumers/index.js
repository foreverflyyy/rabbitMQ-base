const {getAndCreateChannel} = require("../serviceConfig/rabbitMq");

const consumers = {
    // Название vhost
    "/": {
        queues: {},
        exchanges: {}
    },
    "sending_letter": {
        queues: {
            "send-now-letter": {
                options: { exclusive: false },
                callback: require("./sending_letter")
            }
        },
        exchanges: {
            "send-delayed-message": {
                type: "x-delayed-message",
                options: { durable: true, arguments: {"x-delayed-type": "direct"} },
                routerKeys: {
                    "delivery": {
                        options: { exclusive: false },
                        callback: require("./sending_letter")
                    }
                }
            }
        }
    }
}

const createRouterKeys = async (channel, exchangeName, routerKeys) => {
    if(!channel || !routerKeys) {
        return;
    }

    for(const [routeKey, {options = {}, callback}] of Object.entries(routerKeys)) {
        const { queue } = await channel.assertQueue(routeKey, options);
        await channel.bindQueue(queue, exchangeName, routeKey);

        await channel.consume(queue, async (message) => {
            await callback(message, true);
        }, { noAck: true });
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
    if(!channel || !queues) {
        return;
    }

    for(const [queueName, {options = {}, callback}] of Object.entries(queues)) {
        await channel.assertQueue(queueName, options);
        await channel.consume(queueName, async (message) => {
            await callback(message);
        }, { noAck: true });
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
        const channel = await getAndCreateChannel(needVhost);
        await createQueues(channel, queues);
        await createExchanges(channel, exchanges);
    } catch(err) {
        throw new Error(`Произошла ошибка: ${err}`)
    }

    console.log(`Vhosts: ${needVhost} ready.`);
}

const VHOST = process.env.VHOST ? process.env.VHOST : "/";
(async () => {await initConsumers(VHOST);})();