import {
    Order,
    OrderWithDeliveryAddress,
    OrderWithPhone
} from "@/serviceConfig/rabbitMq/types";

export const isOrderWithPhone = (order: Order): order is OrderWithPhone => Boolean(order.phone);

export const isOrderWithEmail = (order: Order): order is OrderWithPhone => Boolean(order.email);

export const isOrderWithDeliveryAddress = (order: Order): order is OrderWithDeliveryAddress =>
    Boolean(order.deliveryAddress);