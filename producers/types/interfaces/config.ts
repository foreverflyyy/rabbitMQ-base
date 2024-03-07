import { Options } from "amqplib";
import { ExchangeTypes, Types } from "../constants";

export interface Queue {
    name: string;
    assertOptions?: Options.AssertQueue;
    publishOptions?: Options.Publish;
}

export interface Exchange {
    name: string;
    type: ExchangeTypes;
    assertOptions?: Options.AssertExchange;
    publishOptions?: Options.Publish;
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

export type ConnectionData = ConnectionConfig | string;

export interface PipelineConfig {
    connectionConfig: ConnectionData,
    queues: Queue[];
    exchanges: Exchange[];
    bindings: Binding[];
}