const amqp = require("amqplib");

const config = {
    protocol: 'amqp',
    hostname: '94.228.113.82',
    port: 5672,
    username: 'root',
    password: 'Ys=c\';;eH<EfyN6L'
}

const service = {};
// Ключ - vhost, значение - connection и channel
service.vhosts = {};
// Ключ - имя exchange, значение - список его очередей
service.exchanges = {};
// Ключ - имя очереди, значение - флаг доступности
service.queues = {};

service.getAndCreateChannel = async (vhostName) => {
    if(vhostName !== "" && !vhostName) {
        return null;
    }

    let vhostData = service.vhosts[vhostName];
    if(!vhostData) {
        const connection = await amqp.connect({...config, vhost: vhostName});
        const channel = await connection.createChannel();
        vhostData = {connection, channel};
        service.vhosts[vhostName] = vhostData;
    }

    return vhostData.channel;
}

service.sendMessageToQueue = async ({channel, queueName, message}) => {
    if(!channel || queueName !== "" && !queueName) {
        return null;
    }

    if(!service.queues[queueName]) {
        service.queues[queueName] = 1;
        await channel.assertQueue(queueName);
    }

    const dataMessage = Buffer.from(JSON.stringify(message));
    await channel.sendToQueue(queueName, dataMessage);
}

service.sendMessageToExchange = async ({
    channel,
    exchangeName,
    routerKey,
    message,
    exchangeType = "direct",
    createOptions = {},
    sendOptions = {}
}) => {
    if(!channel || (exchangeName !== "" && !exchangeName) ||
        !exchangeType || (routerKey !== "" && !routerKey))
    {
        return null;
    }

    if(!service.exchanges[exchangeName]) {
        service.exchanges[exchangeName] = [];
        await channel.assertExchange(exchangeName, exchangeType, createOptions);
    }

    // Привязка очереди к маршрутизатору
    const routers = service.exchanges[exchangeName];
    if(!routers[routerKey]) {
        routers[routerKey] = 1;
        await channel.bindQueue(routerKey, exchangeName ,routerKey);
        await channel.assertQueue(routerKey);
    }

    const dataMessage = Buffer.from(JSON.stringify(message));
    await channel.publish(exchangeName, routerKey, dataMessage, sendOptions);
}

service.initBaseVhosts = (baseVhosts= []) => {
    try {
        (async () => {
            for(const vhost of baseVhosts) {
                await service.getAndCreateChannel(vhost);
            }
        })();
    } catch(err) {
        throw new Error(`Не удалось подключиться по baseVhosts, возможно указан vhost который не существует. ${err}`);
    }
}

process.once("SIGINT", async () => {
    for(const {connection, channel} of Object.values(service.vhosts)) {
        channel.close();
        connection.close();
    }
});

module.exports = service;