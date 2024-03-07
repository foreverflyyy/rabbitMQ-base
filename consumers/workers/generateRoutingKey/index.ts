import { Worker } from '../../Worker';
import {isOrderWithPhone, isOrderWithDeliveryAddress} from "../../utils/checks";
import {
    Order,
    Message,
    Keys
} from '../../types';

export class GenerateRoutingKey extends Worker<Order> {
    constructor() {
        super({ active: 'generateRoutingKey', exchange: 'postprocessing' });
    }

    protected handler(order: Order) {
        try {
            const routingKey: string[] = [];
            if (isOrderWithPhone(order)) {
                routingKey.push(Keys.SEND_SMS);
            }
            if (isOrderWithDeliveryAddress(order)) {
                routingKey.push(Keys.SEND_TO_DELIVERY);
            }
            const message: Message<Order> = {
                retry: 0,
                errors: [],
                order
            };
            this.chanel.publish(this.exchange, routingKey.join('.'), Buffer.from(JSON.stringify(message)));
            this.ack();
        } catch (error) {
            console.error(error);
            this.sendToErrorStorage(error as string);
        }
    }
}
