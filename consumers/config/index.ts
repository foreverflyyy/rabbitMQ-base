import { ConnectionConfig, PipelineConfig } from "../types";
import exchanges from './exchanges';
import queues from './queues';
import bindings from './bindigs';

const connectConfig: ConnectionConfig = {
    protocol: 'amqp',
    hostname: '94.228.113.82',
    port: 5672,
    username: 'root',
    password: 'Ys=c\';;eH<EfyN6L'
};

export default {
    connectionConfig: connectConfig,
    exchanges,
    queues,
    bindings
} as PipelineConfig;