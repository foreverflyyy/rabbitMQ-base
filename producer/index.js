const Express = require("express");
const {connectToRabbitMQ} = require("../rabbitMq");

const app = Express();

let rabbitConnection;
const PORT = process.env.PORT ?? 8000;
const HOST = process.env.HOST ?? "localhost";

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

app.get('/', async (req, res) => {
    const QUEUE_NAME = 'user-registration';
    const messageData = {
        fullName: "name",
        emailAddress: "email",
        confirmationCode: Math.floor(Math.random() * 900000) + 100000,
    };
    const messageDataAsString = JSON.stringify(messageData);

    const channel = await rabbitConnection.createChannel();
    channel.sendToQueue(QUEUE_NAME, Buffer.from(messageDataAsString));

    return res.json({message: 'User registered successfully'});
});

app.get('/withExchange', async (req, res) => {
    const exchangeName = 'users';
    const messageData = {
        fullName: "name",
        emailAddress: "email",
        confirmationCode: Math.floor(Math.random() * 900000) + 100000,
    };
    const messageDataAsString = JSON.stringify(messageData);

    const channel = await rabbitConnection.createChannel();

    await channel.assertExchange(exchangeName, 'fanout', {
        durable: true,
    });

    channel.publish(exchangeName, '', Buffer.from(messageDataAsString));

    return res.json({ message: 'User registered successfully' });
});

app.listen(PORT, async () => {
    rabbitConnection = await connectToRabbitMQ();
    console.log(`Application started on URL ${HOST}:${PORT} 🎉`);
});