const amqp = require("amqplib");

const queue = "product_inventory";

let connection;
let channel;

const sendMessage = async () => {
    const text = {item_id: "macbook", text: "This is a sample message.",};

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(text)));
    console.log("Sent message");
}

const init = async () => {
    try {
        connection = await amqp.connect("amqp://localhost");
        channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: false });

        await sendMessage();

        await channel.close();
    } catch (err) {
        console.warn(err);
    } finally {
        if (connection)
            await connection.close();
    }
}

(async () => await init())();
