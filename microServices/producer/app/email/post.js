const {nanoid} = require("nanoid");

const defaultConfig = {
    vhost: "sending_letter",
    queues: ["send-now-letter"],
    exchanges: [
        {
            name: "send-delayed-message",
            type: "x-delayed-message",
            assertOptions: { arguments: {"x-delayed-type":  "direct"} },
            routerKey: "send-delayed-letter",
            publishOptions: {headers: {"x-delay": 20000}}
        }
    ]
}

const processingExchanges = async (data) => {
    const {channel, exchanges = [], letter, rabbitService, redisService} = data;

    for(const exchange of exchanges) {
        const id = nanoid();
        await redisService.set(id, letter);

        const dataForSend = {
            channel,
            exchangeName: exchange.name,
            exchangeType: exchange.type,
            message: {id},
            routerKey: exchange.routerKey,
            assertOptions: exchange.assertOptions,
            publishOptions: exchange.publishOptions
        };
        await rabbitService.sendMessageToExchange(dataForSend);
    }
}

const processingQueues = async (data) => {
    const {channel, queues = [], letter, rabbitService, redisService} = data;

    for(const queue of queues) {
        const id = nanoid();
        await redisService.set(id, letter);

        const dataForSend = {channel, queueName: queue, message: {id}};
        await rabbitService.sendMessageToQueue(dataForSend);
    }
}

const isString = (field) => typeof field === 'string' || field instanceof String;

const checkConfig = (config) => {
    const {vhost, queues = [], exchanges = []} = config;
    if(!vhost) {
        return false;
    }

    const unCorrectQueues = queues.some((queue) => !isString(queue));
    const unCorrectExchanges = exchanges.some((exchange) => {
        if(!exchange) {
            return true;
        }
        const {name, type, routerKey} = exchange;
        return !name || !isString(name) || !type || !isString(type) || !routerKey || !isString(routerKey);
    });

    return !(unCorrectQueues || unCorrectExchanges);
}

module.exports = async (req, rabbitService, redisService) => {
    const {config, letter} = req.body;
    if(!letter || !config || !checkConfig(config)) {
        return {success: false, data: "Некорректно переданы данные."};
    }

    const {vhost, queues, exchanges} = config;
    const channel = await rabbitService.getAndCreateChannel(vhost);
    await processingQueues({channel, queues, letter, rabbitService, redisService});
    await processingExchanges({channel, exchanges, letter, rabbitService, redisService});

    return {success: true, data: "Успешная отправка запроса."};
}