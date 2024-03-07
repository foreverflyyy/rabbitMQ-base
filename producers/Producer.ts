import { RabbitConnect } from "./RabbitConnect";
import { PipelineConfig } from "./types";

export class Producer extends RabbitConnect {
    private readonly _config: PipelineConfig;

    constructor(pipelineConfig: PipelineConfig) {
        super(pipelineConfig.connectionConfig);
        this._config = pipelineConfig;
    }

    public async sendMessageToQueue(queueName: string, message: any) {
        await this.connect();

        if (!this.channel || !(global as any)._isString(queueName)) {
            return;
        }

        const foundQueue = this._config.queues.find(queue =>
            queue.name === queueName);
        if (!foundQueue) {
            return;
        }

        const dataMessage = Buffer.from(JSON.stringify(message));
        this.channel.sendToQueue(queueName, dataMessage, foundQueue.publishOptions ?? {});

        await this.disconnect();
    }

    public async sendMessageToExchange(exchangeName: string, message: any) {
        await this.connect();

        if (!this.channel || !(global as any).isString(exchangeName)) {
            return;
        }

        const foundExchange = this._config.exchanges.find(exchange =>
            exchange.name === exchangeName);
        const foundBinding = this._config.bindings.find(binding =>
            binding.source === exchangeName);
        if (!foundBinding || !foundExchange) {
            return;
        }

        const dataMessage = Buffer.from(JSON.stringify(message));
        this.channel.publish(exchangeName, foundBinding.routingKey, dataMessage, foundExchange.publishOptions);

        await this.disconnect();
    }
}
