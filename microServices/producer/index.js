const router = require('express').Router()
const requestIp = require('request-ip');

router.use(requestIp.mw());

const accessCheck = {
    app: require('./accessCheck/app'),
}
const middleware = {
    app: require('./app'),
}

router.use('/app/*', accessCheck.app);
router.get('/app/:collection', middleware.app);
router.post('/app/:collection', middleware.app);
router.get('/app/:collection/:id', middleware.app);

module.exports = router;