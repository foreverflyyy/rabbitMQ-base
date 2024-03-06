const axios = require("axios");
const redisService = require("../../serviceConfig/redis");

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

const sendLetter = async (message) => {
    try {
        const resp = await instance.post('/email/send.json', message)
        if(resp.status === 200) {
            return {code: 0, data: resp}
        }
        return {code: 1, data: resp}
    } catch (e) {
        if(e?.response?.status === 400) {
            return {code: 1, data: "Ошибка отправки сообщения на почту. Неверно переданы параметры", err: e};
        }
        return {code: 2, data: "Ошибка отправки сообщения на почту.", err: e};
    }
}

const prepareAndSendLetter = async (message, params) => {
    const {deleteFromRedis = false} = params;
    const {id} = JSON.parse(message.content.toString())
    if(!id)
        return {code: 1, data: "Id не был найден в базе Redis"};

    let letterData;
    if(deleteFromRedis) {
        const result = await redisService.getAndDelete(id);
        if(!result.success)
            return {code: 2, data: "Ошибка запроса redisGetAndDelete"};
        letterData = result.data;
    } else {
        const result = await redisService.get(id);
        if(!result.success)
            return {code: 2, data: "Ошибка запроса redisGet"};
        letterData = result.data;
    }

    letterData = JSON.parse(letterData);
    return await sendLetter(letterData);
}

module.exports = prepareAndSendLetter;