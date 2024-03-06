const path = require('path');

module.exports = {
    apps : [
        {
            name: 'micro-queue-root-producer',
            script: './index.js',
            watch: ['microServices/producer', 'serviceConfig', 'serviceSchemas/producer'],
            ignore_watch: ['node_modules', 'tmp'],
            cwd: path.resolve(__dirname),
            env: {
                DIST: 'producer',
                DEV: true,
            },
            env_production: {
                DIST: 'producer',
                DEV: false,
            }
        },
        {
            name: 'consumer-sending-letter',
            script: 'consumers/index.js',
            watch: ['./', '../serviceConfig/rabbitMq', '../serviceConfig/redis'],
            ignore_watch: ['node_modules', 'tmp'],
            cwd: path.resolve(__dirname),
            env: {
                VHOST: "sending_letter"
            },
            env_production: {
                VHOST: "sending_letter"
            }
        }
    ]
};
