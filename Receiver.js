const amqp = require("amqplib");
const queue = "product_inventory";
let connection;
let channel;

const action = async (data) => {
    // console.log({data})
    if (!data.content)
        return;

    // const parsedData = JSON.parse(data.content.toString());
    // console.log("Received: ", JSON.parse(parsedData));
    console.log("Received '%s'", JSON.parse(data.content.toString()));
}

const init = async () => {
    try {
        connection = await amqp.connect("amqp://localhost");
        channel = await connection.createChannel();

        await channel.assertQueue(queue, {durable: false});
        await channel.consume(queue, action, {noAck: true});

        process.once("SIGINT", async () => {
            await channel.close();
            await connection.close();
        });

        console.log("Waiting for messages... To exit press CTRL+C");
    } catch (err) {
        console.warn(err);
    }
}

(async () => await init())();
