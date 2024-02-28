const amqp = require("amqplib");

// let exchangeName = "users";
// let exchangeType = "fanout";
(async () => {
    const rabbitConnection = await amqp.connect({
        protocol: 'amqp',
        hostname: '94.228.113.82',
        port: 5672,
        username: 'root',
        password: 'root',
        vhost: 'sending_letter'
    });

    const mainQueueName = 'send-letter';

    const exchangeName = "letters";
    const exchangeType = "x-delayed-message";
    // const exchangeName = "users";
    // const exchangeType = "fanout";

    const recipientName = "delivery";

    const channel = await rabbitConnection.createChannel();
    await channel.assertQueue(mainQueueName, { exclusive: false });

    await channel.assertExchange(exchangeName, exchangeType, { durable: true });
    const { queue } = await channel.assertQueue(recipientName, { exclusive: false });
    await channel.bindQueue(queue, exchangeName, recipientName);

    let count1 = 0;
    let count2 = 0;
    await channel.consume(mainQueueName, async (message) => {
        console.log("сообщение1: ", count1++)
    }, { noAck: true });

    await channel.consume(queue, async (message) => {
        console.log("сообщение2: ", count2++)
    }, { noAck: true });

    process.once("SIGINT", async () => {
        await channel.close();
        await rabbitConnection.close();
    });

    console.log("Ready")
})();
