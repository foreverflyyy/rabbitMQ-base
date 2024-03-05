const path = require('path');

module.exports = {
    apps : [
        {
            name: 'consumer-sending-letter',
            script: 'index.js',
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
