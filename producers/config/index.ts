import { PipelineConfig } from "../types";
import exchanges from './exchanges';
import queues from './queues';
import bindings from './bindigs';

/*const connectionConfig: ConnectionData = {
    protocol: 'amqp',
    hostname: '94.228.113.82',
    port: 5672,
    username: 'root',
    password: 'Ys=c\';;eH<EfyN6L'
};*/

/*const connectionConfig: ConnectionData = {
    protocol: 'amqp',
    hostname: '127.0.0.1',
    port: 5672,
    username: 'root',
    password: 'root'
};*/

// const connectionConfig: ConnectionData = 'amqp://localhost';

export default {
    connectionConfig: 'amqp://localhost',
    exchanges,
    queues,
    bindings
} as PipelineConfig;