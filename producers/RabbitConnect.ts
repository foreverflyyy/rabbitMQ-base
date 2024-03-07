import { connect, Connection, Channel } from 'amqplib';
import { ConnectionData } from "@/serviceConfig/rabbitMq/types";

export class RabbitConnect {
    private readonly _connectionConfig: ConnectionData;
    private _connection!: Connection;
    private _channel!: Channel;

    protected constructor(config: ConnectionData = 'amqp://localhost') {
        this._connectionConfig = config;
    }

    protected async connect() {
        this._connection = await connect(this._connectionConfig);
        this._channel = await this._connection.createChannel();
    }

    protected async disconnect() {
        await this._channel.close();
        return this._connection.close();
    }

    protected get channel() {
        return this._channel;
    }
}
