const fs=require('fs');
const crypto = require('crypto');
const secret = 'lXHtoCzA9n';

const getFiles = (dir) => {
    try {
        const files = fs.readdirSync(dir);
        return files.reduce((acc, row) => {
            acc.push(row.replace('.js', ''))
            return acc
        }, []);
    } catch(err) {
        return [];
    }
}

const services = [
    {
        serviceName: 'producer',
        port: 6061,
        includeServices: [],
        connections: ['consumer'],
        sentryDsn: 'https://82e90dc8dddb02d937f426ba4dc6cec7@o4505838147796992.ingest.sentry.io/4505872132210688'
    }
]

const isProd = !!(process.env.DEV && process.env.DEV === 'false');
const forceProdConnect = !!process.env.PROD;

const getBdPath = ({collections, type='dev'}) => {
    switch (type) {
        case 'prod':
            return `mongodb://risPrimaryBd:9PB10ejrQN9RI0cpISmP@185.200.243.86:27017/${collections}?tls=true&tlsCAFile=${__dirname}/serviceConfig/RisPrimary/mongoCA.pem&tlsCertificateKeyFile=${__dirname}/serviceConfig/RisPrimary/client_primary.pem&tlsInsecure=true&authMechanism=DEFAULT&authSource=admin`
        default:
            return `mongodb://risPrimaryBd:9PB10ejrQN9RI0cpISmP@212.60.20.96:27017/${collections}?tls=true&tlsCAFile=${__dirname}/serviceConfig/RisDev/mongoCA.pem&tlsCertificateKeyFile=${__dirname}/serviceConfig/RisDev/client.pem&tlsInsecure=true&authMechanism=DEFAULT&authSource=admin`
    }
}
const arrayBd = [];
const reduceServices = services.reduce((acc, service) => {
    let bdType = service.primaryBd ? service.primaryBd : isProd ? 'prod':'dev'
    if (forceProdConnect){
        bdType = 'prod'
    }
    arrayBd.push(service.serviceName)
    acc[service.serviceName] = {
        servicesPath: `${__dirname}/microServices/${service.serviceName}`,
        port: service.port,
        defaultDb: service.serviceName,
        sentryDsn: service.sentryDsn,
        clusterCount: service.clusterCount ? service.clusterCount : 0,
        serviceKey: crypto.createHmac('sha512', secret).update(service.serviceName).digest('hex'),
        key: crypto.createHmac('sha256', secret).update(service.serviceName).digest('hex'),
        includeServices: service.includeServices && service.includeServices.length ? service.includeServices : [],
        connections: service.connections && service.connections.length ? service.connections.map((it) => {
            return {
                dbUrl: getBdPath({collections: it, type: bdType}),
                dbName: it,
                includeShemas: getFiles(`${__dirname}/serviceSchemas/${it}`)
            }
        }) : [],
    }
    return acc;
}, {});

module.exports = reduceServices;