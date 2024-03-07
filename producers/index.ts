import config from "./config";
import { Pipeline } from "./Pipeline";
import { Producer } from "./Producer";

let producer;
(async () => {
    try {
        const pipeline = new Pipeline(config);
        await pipeline.create();

        producer = new Producer(config);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

export default producer;