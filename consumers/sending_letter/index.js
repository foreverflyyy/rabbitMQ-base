const axios = require("axios");
const redisService = require("../../serviceConfig/redis");

/*
Варианты получения ответа от callback:
0 - успешное выполнение
1 - ошибка процесса, отмена сообщения
2 - ошибка процесса, продолжить вызов callback
*/

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
        const response = await instance.post('/email/send.json', message);
        return {code: 0, data: response};
    } catch (e) {
        const status = e?.response?.status;
        if(status >= 500) {
            return {code: 1, data: "Сервер по отправке вне доступа.", err: e};
        }

        return {code: 2, data: "Ошибка отправки сообщения на почту.", err: e};
    }
}

const jsonParse = (data) => {
    try {
        return JSON.parse(data);
    } catch(e) {
        return null;
    }
}

const prepareAndSendLetter = async (message) => {
    const messageData = jsonParse(message.content.toString())
    if(!messageData || !messageData.id)
        return {code: 1, data: "Id не был найден в базе Redis"};

    const result = await redisService.getAndDelete(messageData.id);
    if(!result.success || !result.data)
        return {code: 1, data: "Ошибка запроса получения данных по id."};

    const letterData = jsonParse(result.data);
    if(!letterData)
        return {code: 1, data: "Некорректные данные по id."};

    return await sendLetter(letterData);
}

module.exports = prepareAndSendLetter;