import { RabbitConnect } from "./RabbitConnect";
import { Message, Order, FailOrder } from "./types";
import { ConsumeMessage } from "amqplib";

export interface WorkerParams {
    maxRetry?: number;
    active: string;
    exchange: string;
    holdKey?: string;
}

export abstract class Worker<M extends Order> extends RabbitConnect {
    private readonly _maxRetry: number;
    private readonly _active: string;
    private readonly _holdKey: string | undefined;
    protected exchange: string;
    private _currentMessage?: Message<M>;
    private _currentConsumeMessage?: ConsumeMessage;

    protected constructor({ active, holdKey, exchange, maxRetry }: WorkerParams) {
        super();
        this._maxRetry = maxRetry || 0;
        this._active = active;
        this._holdKey = holdKey;
        this.exchange = exchange;
    }

    public async subscribe() {
        await this.connect();
        await this.chanel.consume(this._active, this.checkMessage.bind(this));
    }

    private checkMessage(message: ConsumeMessage | null) {
        if (!message) {
            return;
        }

        this._currentConsumeMessage = message;
        const orderMessage: Message<M> = JSON.parse(message.content.toString());
        if (orderMessage.retry >= this._maxRetry) {
            this.sendToErrorStorage("Превышен лимит попыток");
        }
        this._currentMessage = orderMessage;
        this.handler(orderMessage.order || orderMessage);
    }

    protected sendToErrorStorage(error: string) {
        if (!this._currentMessage)
            return;

        const message: FailOrder = {
            order: this._currentMessage.order,
            errors: [...this._currentMessage.errors, error],
            retry: this._currentMessage.retry + 1,
            exchange: this.exchange,
            routingKey: this._active
        };
        console.log("Отправка в хранилище ошибок", message);
        this.ack();
    }

    protected hold(error: string) {
        if (!this._holdKey || !this._currentMessage) {
            return;
        }
        const orderMessage = {
            order: this._currentMessage.order,
            errors: [...this._currentMessage.errors, error],
            retry: this._currentMessage.retry + 1
        };
        const orderData = Buffer.from(JSON.stringify(orderMessage));
        return this.chanel.publish(this.exchange, this._holdKey, orderData);
    }

    // TODO: Добавить проверку noAck true или false
    protected ack() {
        this._currentConsumeMessage
            ? this.chanel.ack(this._currentConsumeMessage)
            : null;
    }

    protected abstract handler(message: M): void;
}
