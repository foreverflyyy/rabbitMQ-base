const amqp = require("amqplib");
module.exports = async (req) => {
    const {data} = req.body;

    const messageData = {hi: "hello"}
    const messageDataAsString = JSON.stringify({letter});

    const rabbitConnection = await amqp.connect({
        protocol: 'amqp',
        hostname: '94.228.113.82',
        port: 5672,
        username: 'root',
        password: 'root',
        vhost: 'sending_letter',
    });

    const mainQueueName = 'send-letter';

    // const exchangeName = "letters";
    // const exchangeType = "x-delayed-message";
    const exchangeName = "users";
    const exchangeType = "fanout";

    const recipientName = "delivery";

    const channel = await rabbitConnection.createChannel();
    await channel.assertQueue(mainQueueName);

    await channel.assertExchange(exchangeName, exchangeType);

    for (let i = 0; i < 3; i++) {
        await channel.sendToQueue(mainQueueName, Buffer.from(messageDataAsString));
        await channel.publish(
            exchangeName,
            recipientName,
            Buffer.from(messageDataAsString),
            {headers: {"x-delay": 5000}}
        );
    }

    return {
        success: true,
        data: data
    }
}

const letter = ""