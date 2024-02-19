const {connectToRabbitMQ} = require("../rabbitMq");

let rabbitConnection;
let exchangeName = "users";
let exchangeType = "fanout";
const queueName = 'user-registration';
(async () => {
    rabbitConnection = await connectToRabbitMQ();
    console.log('Successfully connected to RabbitMQ server!');

    const channel = await rabbitConnection.createChannel();

    // Создаёт временную очередь и делает её эксклюзивной для этого клиента
    await channel.assertExchange(exchangeName, exchangeType);
    const assertQueueResult = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(assertQueueResult.queue, exchangeName, '');

    await channel.consume(assertQueueResult.queue, async (message) => {
        if (!message) {
            console.error('Consumer cancelled by server!');
            return;
        }

        const data = JSON.parse(message.content.toString());
        console.table(data);

        // TODO send an email using the data


        console.log('Email1 sent successfully!');
    }, { noAck: true });

    process.once("SIGINT", async () => {
        await channel.close();
        await rabbitConnection.close();
    });
})();

(async () => {
    rabbitConnection = await connectToRabbitMQ();
    console.log('Successfully connected to RabbitMQ server!');

    const channel = await rabbitConnection.createChannel();

    // Создаёт временную очередь и делает её эксклюзивной для этого клиента
    await channel.assertQueue(queueName, { exclusive: true });

    await channel.consume(queueName, async (message) => {
        if (!message) {
            console.error('Consumer cancelled by server!');
            return;
        }

        const data = JSON.parse(message.content.toString());
        console.table(data);

        // TODO send an email using the data


        console.log('Email2 sent successfully!');
        channel.ack(message);

        // если нужно отменить получение сообщения,
        // чтобы оно могло быть использовано другими приложениями, прослушивающими очередь
        // второй параметр для указания, что мы хотим поставить сообщение повторно в очередь
        // channel.reject(message, true);
    });

    process.once("SIGINT", async () => {
        await channel.close();
        await rabbitConnection.close();
    });
})();