import { Exchange, ExchangeTypes } from "@/serviceConfig/rabbitMq/types";

const exchanges: Exchange[] = [
    {
        name: 'postprocessing',
        type: ExchangeTypes.TOPIC
    },
    {
        name: 'notify',
        type: ExchangeTypes.TOPIC
    },
    {
        name: 'integrates',
        type: ExchangeTypes.TOPIC
    }
];

export default exchanges;
