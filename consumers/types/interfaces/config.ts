import { Options } from "amqplib";
import { ExchangeTypes, Types } from "../constants";

export interface Queue {
    name: string;
    options?: Options.AssertQueue;
}

export interface Exchange {
    name: string;
    type: ExchangeTypes;
    options?: Options.AssertExchange;
}

export interface Binding {
    type: Types;
    destination: string;
    source: string;
    routingKey: string;
    args?: any;
}

export interface ConnectionConfig {
    protocol: string,
    hostname: string,
    port: number,
    username: string,
    password: string,
    vhost?: string
}

export interface PipelineConfig {
    connectionConfig: ConnectionConfig | string,
    queues: Queue[];
    exchanges: Exchange[];
    bindings: Binding[];
}