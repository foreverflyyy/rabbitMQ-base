const secret = '2LamovajaGolova';

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }

    if (req.headers['authorization'] === secret) {
        next();
        return;
    }

    if (req.query['code'] === secret) {
        next();
        return;
    }

    res.status(401).send();
};