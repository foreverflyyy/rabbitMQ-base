import { connect, Connection, Channel } from 'amqplib';

export class RabbitConnect {
    private readonly _config = process.env.RABBIT_URI || 'amqp://localhost';
    private _connection!: Connection;
    private _chanel!: Channel;

    protected async connect() {
        this._connection = await connect(this._config);
        this._chanel = await this._connection.createChannel();
    }

    protected async disconnect() {
        await this._chanel.close();
        return this._connection.close();
    }

    protected get chanel() {
        return this._chanel;
    }
}
