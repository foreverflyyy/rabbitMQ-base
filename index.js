const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");

const cluster = require('node:cluster');
const process = require('node:process');

const Express = require('express');
const bodyParser = require('body-parser');
const servicesConfig = require('./services_config');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const baseVhosts = ["sending_letter"]
const rabbitService = require('./serviceConfig/rabbitMq');
rabbitService.initBaseVhosts(baseVhosts);

require('./serviceConfig/globalUtils');

const isProd = !!(process.env.DEV && process.env.DEV === 'false');

const serviceConfig = process.env.DIST && servicesConfig[process.env.DIST] ? servicesConfig[process.env.DIST] : servicesConfig['producer'];

const include = serviceConfig && serviceConfig.includeServices && serviceConfig.includeServices.length ? serviceConfig.includeServices : false
const includeKey = include ? include.reduce((acc,row) => {
    if (servicesConfig[row] && (servicesConfig[row].key || servicesConfig[row].serviceKey)){
        acc[row] = {
            serviceKey: servicesConfig[row].serviceKey,
            key: servicesConfig[row].key,
            port: servicesConfig[row].port
        }
    }
    return acc
}, {}) : false;

const port = process.env.PORT || serviceConfig.port;
if (cluster.isPrimary) {
    console.log('Port', port);
    console.log('ServiceKey', serviceConfig.serviceKey);
    console.log('ClusterNum', serviceConfig.clusterCount);
    console.log('isProd', isProd);
}
const app = new Express();
let workers = [];

const createAppExpress = () => {
    if (serviceConfig && serviceConfig.sentryDsn){
        Sentry.init({
            dsn: serviceConfig.sentryDsn,
            environment: isProd?'prod':'dev',
            enabled: isProd,
            integrations: [
                // enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // enable Express.js middleware tracing
                new Sentry.Integrations.Express({ app }),
                new ProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: isProd ? 1.0 : 0, // Capture 100% of the transactions, reduce in production!
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: isProd ? 1.0 : 0, // Capture 100% of the transactions, reduce in production!
            debug: false
        });
    }

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    app.use(bodyParser.json({limit: '50mb'}))
    app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

    app.use(cookieParser())
    app.use(fileUpload({}))
    app.use('*', (req, res, next)  => {
        res.header('Access-Control-Allow-Origin', req.header('origin'))
        res.header('Access-Control-Allow-Credentials', 'true')
        res.header('Access-Control-Allow-Headers', 'X-Session, Req-From, Req-Time, Authorization, accept, content-type, content_type, Origin, X-Requested-With, Content-Type, Accept, From-Site-Id, From-Site-Code, from-site-id, from-site-code, SiteIdIn, siteidin, sentry-trace, Req-Reg, req-from, req-client, req-time')
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, PATCH, OPTIONS, PURGE')
        req.serviceConfig = serviceConfig
        req.serviceKey = includeKey
        req.pyKey = 'i562kP69&Co>v56hQa0{?{G$.x1pEejy%!%YO58_px%YAxuB>mv}ILsNaNGi8uE'
        req.puppeteerKey = 'hssKNov97MDV99NzOUxYLAV4HpwZN2XSxktH3bcjPTo21d2Z6aUwMCJiAIOSJAbh'
        req.phpKey = '7Y@=Bz)"xYIS6PSoQWno=fkH(A!#FOlm$.wPanllHS~kRK}caZ/h|LC#}rlNMuu'
        next()
    })
    app.use('/services', require(serviceConfig.servicesPath))
    app.use(Sentry.Handlers.errorHandler());
    // Sentry.captureException(new Error('test exception'));
    app.use(function(err, req, res, next) {
        res.statusCode = 500;
        res.end(res.sentry + "\n");
      // res.status(500).send('Server error');
    });

    app.listen(port)
}

const clusterCount = serviceConfig.clusterCount !== 0 && isProd ? serviceConfig.clusterCount : 0;
const isNeedCluster = clusterCount !== 0;

if (cluster.isPrimary && isNeedCluster) {
    for(let i = 0; i < clusterCount; i++) {
        workers.push(cluster.fork());
        workers[i].on('message', function(message) {
            console.log('message', message);
        });
    }
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is listening');
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
        workers.push(cluster.fork());
        workers[workers.length-1].on('message', function(message) {
            console.log(message);
        });
    });
}else{
    createAppExpress()
}
