import { Queue } from "@/serviceConfig/rabbitMq/types";

const queues: Queue[] = [
    {
        name: 'generateRoutingKey',
        assertOptions: {
            durable: true
        },
        publishOptions: {}
    },
    {
        name: 'sendSms',
        assertOptions: {
            durable: true
        }
    },
    {
        name: 'delivery',
        assertOptions: {
            durable: true
        }
    },
    {
        name: 'sendSmsHold',
        assertOptions: {
            durable: true,
            deadLetterExchange: 'notify',
            deadLetterRoutingKey: 'sendSms',
            messageTtl: 60000
        }
    },
    {
        name: 'deliveryHold',
        assertOptions: {
            durable: true,
            deadLetterExchange: 'integrates',
            deadLetterRoutingKey: 'delivery',
            messageTtl: 60000
        }
    }
];

export default queues;