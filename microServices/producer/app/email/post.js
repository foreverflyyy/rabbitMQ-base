const {nanoid} = require("nanoid");

const vhostName = "sending_letter";
const mainQueueName = 'send-now-letter';

const exchangeName = "send-delayed-message";
const exchangeType = "x-delayed-message";

const recipientName = "send-delayed-letter";
const timeDelayForSendingLetter = 20 * 1000; // 20 sec

module.exports = async (req, rabbitService, redisService) => {
    let {data} = req.body;
    if(!data) {
        return {success: false, data: "Переданы не все данные."};
    }

    const id = nanoid();
    await redisService.set(id, data);

    const channel = await rabbitService.getAndCreateChannel(vhostName);
    await rabbitService.sendMessageToQueue({
        channel,
        queueName: mainQueueName,
        message: {id}
    });

    await rabbitService.sendMessageToExchange({
        channel,
        exchangeName,
        exchangeType,
        message: {id},
        routerKey: recipientName,
        createOptions: { arguments: {'x-delayed-type':  "direct"} },
        sendOptions: {headers: {"x-delay": timeDelayForSendingLetter}}
    });

    return {success: true, data: "Успешная отправка запроса."};
}