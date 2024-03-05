const Redis = require("ioredis");

const config = {
    host: '94.228.113.82',
    port: 6379,
    password: 'wVJzLH5k,<D$X^Kb'
}

const redisConnection = new Redis(config);

const service = {redisConnection};
service.get = async (key) => {
    try {
        const result = await redisConnection.get(key);
        return {success: true, data: result}
    } catch (err) {
        return {success: false, data: "Произошла ошибка Redis.", err: err};
    }
}

service.getAndDelete = async (key) => {
    try {
        const result = await redisConnection
            .multi()
            .get(key)
            .del(key)
            .exec();
        return {success: true, data: result[0][1]}
    } catch (err) {
        return {success: false, data: "Произошла ошибка Redis.", err: err};
    }
}

service.set = async (key, value) => {
    try {
        await redisConnection.set(key, JSON.stringify(value));
        return {success: true, data: "Успешная установка значения."}
    } catch (err) {
        return {success: false, data: "Произошла ошибка Redis.", err: err};
    }
}

module.exports = service;