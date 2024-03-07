import config from "./config";
import { Pipeline } from "./Pipeline";
import { SendSms, Delivery, GenerateRoutingKey } from "./workers";

(async () => {
    try {
        const pipeline = new Pipeline(config);

        const generateRoutingKey = new GenerateRoutingKey();
        const sendSms = new SendSms();
        const delivery = new Delivery();

        await pipeline.create();
        await Promise.all([
            generateRoutingKey.subscribe(),
            sendSms.subscribe(),
            delivery.subscribe()
        ]);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();