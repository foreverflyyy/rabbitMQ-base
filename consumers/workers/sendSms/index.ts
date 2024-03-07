import { Worker } from '../../Worker';
import { OrderWithPhone } from '../../types';

export class SendSms extends Worker<OrderWithPhone> {
    constructor() {
        super({
            active: 'sendSms',
            exchange: 'notify',
            holdKey: 'sendSmsHold',
            maxRetry: process.env.MAX_RETRY ? parseInt(process.env.MAX_RETRY) : 5
        });
    }

    protected handler(message: OrderWithPhone) {
        try {
            console.log('Отправка sms на номер: ', message.phone);
            this.ack();
        } catch (error) {
            this.hold(error as string);
        }
    }
}