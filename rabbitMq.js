const amqp = require("amqplib");
const mod = {};

let rabbitConnection;
let channel;

// Создание exchange
// await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE);

// Привязака очереди к exchange с помощью ключа маршрутизации
// await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, KEY);

mod.connectToRabbitMQ = async () => {
    /*rabbitConnection = await amqp.connect({
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest',
        // locale: 'en_US',
        // frameMax: 0,
        // heartbeat: 0,
        vhost: '/',
    });*/
    // amqp://<username>:<password>@<host>:<port>
    // rabbitConnection = amqp.connect('amqp://admin:MyStrong-P4ssw0rd$@rabbitmq.tericcabrel.com');
    rabbitConnection = await amqp.connect("amqp://localhost");
    return rabbitConnection;
};

mod.sendMessage = async (queueName, message, exchangeType='fanout') => {
    try {
        const messageDataAsString = JSON.stringify(message);
        if(!channel) {
            channel = await rabbitConnection.createChannel();
        }

        const exchangeName = "users"
        await channel.assertExchange(exchangeName, exchangeType, {durable: false,});
        channel.publish(exchangeName, '', Buffer.from(messageDataAsString));
        // channel.sendToQueue(queueName, Buffer.from(messageDataAsString));
        return {success: true, data: 'Successfully sent!'};
    } catch(err) {
        return {success: false, data: err};
    }
}

module.exports = mod;