const axios = require("axios");
const {get: redisGet, getAndDelete: redisGetAndDelete} = require("../../serviceConfig/redis");

const apiUnSenderKey = '6xh33kwn9m95ng1i1myjrxsqan3a6moaymp8inny'
let headers = {
    "Content-Type": "application/json",
    "X-API-KEY": apiUnSenderKey,
};

const instance = axios.create({
    baseURL: 'https://go1.unisender.ru/ru/transactional/api/v1',
    headers: headers,
    _withCredentials: true,
    responseType: "json",
});

const checkReceivingData = (data) => {
    if(!data || !data.message) {
        return {success: false, data: "Переданы не все данные."};
    }

    return {success: true};
}

const sendLetter = async (message) => {
    const checkMessage = checkReceivingData(message);
    if(!checkMessage.success){
        return checkMessage;
    }

    try {
        const resp = await instance.post('/email/send.json', message)
        return {success: true, data: resp}
    } catch (e) {
        return {success: false, msg: "Ошибка отправки сообщения на почту", err: e};
    }
}

const prepareAndSendLetter = async (message, isWithDelay = false) => {
    const {id} = JSON.parse(message.content.toString())
    if(!id)
        return;

    let letterData;
    if(isWithDelay) {
        const result = await redisGetAndDelete(id);
        if(!result.success)
            return;
        letterData = result.data;
    } else {
        const result = await redisGet(id);
        if(!result.success)
            return;
        letterData = result.data;
    }

    letterData = JSON.parse(letterData);
    await sendLetter(letterData);
}

module.exports = prepareAndSendLetter;