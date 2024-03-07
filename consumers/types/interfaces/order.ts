import { Types } from "../constants";

export interface Product {
    id: string;
    name: string;
    price: number;
    discount: number;
    total: number;
}

export interface Order {
    clientName: string;
    type: Types;
    city: string;
    email?: string;
    phone?: string;
    products: Product[];
    totalSum: number;
    deliveryAddress?: string;
}

export interface OrderWithPhone extends Order {
    phone: string;
}

export interface OrderWithEmail extends Order {
    email: string;
}

export interface Message<O extends Order> {
    errors: string[];
    retry: number;
    order: O;
}

export interface OrderWithDeliveryAddress extends Order {
    deliveryAddress: string;
}

export interface FailOrder extends Message<Order> {
    exchange: string;
    routingKey: string;
}