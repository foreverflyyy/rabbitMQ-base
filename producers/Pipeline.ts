import { RabbitConnect } from "./RabbitConnect";
import { PipelineConfig, Types } from "./types";

export class Pipeline extends RabbitConnect {
    private _pipeline: PipelineConfig;

    constructor(pipelineConfig: PipelineConfig) {
        super(pipelineConfig.connectionConfig);
        this._pipeline = pipelineConfig;
    }

    public async create() {
        try {
            await this.connect();

            const createQueues = this._pipeline.queues.map(queue => {
                const {name, assertOptions} = queue;
                return this.channel.assertQueue(name, assertOptions);
            }) as PromiseLike<any>[];

            const createExchanges = this._pipeline.exchanges.map(exchange => {
                const {name, type, assertOptions = {}} = exchange;
                return this.channel.assertExchange(name, type, assertOptions);
            }) as PromiseLike<any>[];

            await Promise.all([...createQueues, ...createExchanges]);

            const createBindings = this._pipeline.bindings.map(binding => {
                const {type, destination, source, routingKey, args = {}} = binding;
                if (type === Types.QUEUE) {
                    return this.channel.bindQueue(destination, source, routingKey, args);
                }
                return this.channel.bindExchange(destination, source, routingKey, args);
            });

            await Promise.all(createBindings);
        } catch (error) {
            console.log(error);
            throw new Error(error as string);
        } finally {
            await this.disconnect();
        }
    }
}
