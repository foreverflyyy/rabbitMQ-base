import { RabbitConnect } from "./RabbitConnect";
import { PipelineConfig, Types } from "./types";

export class Pipeline extends RabbitConnect {
    private _pipeline: PipelineConfig;

    constructor(pipelineConfig: PipelineConfig) {
        super();
        this._pipeline = pipelineConfig;
    }

    public async create() {
        try {
            await this.connect();

            const createQueues = this._pipeline.queues.map(queue =>
                this.chanel.assertQueue(queue.name, queue.options)
            ) as PromiseLike<any>[];

            const createExchanges = this._pipeline.exchanges.map(exchange =>
                this.chanel.assertExchange(exchange.name, exchange.type, exchange.options ?? {})
            ) as PromiseLike<any>[];

            await Promise.all([...createQueues, ...createExchanges]);

            const createBindings = this._pipeline.bindings.map(binding => {
                if (binding.type === Types.QUEUE) {
                    return this.chanel.bindQueue(
                        binding.destination,
                        binding.source,
                        binding.routingKey,
                        binding.args ?? {}
                    );
                }
                return this.chanel.bindExchange(
                    binding.destination,
                    binding.source,
                    binding.routingKey,
                    binding.args ?? {}
                );
            });

            await Promise.all(createBindings);
            return this.disconnect();
        } catch (error) {
            console.log(error);
            throw new Error(error as string);
        }
    }
}
