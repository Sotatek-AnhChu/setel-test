import { EOrderStatus } from "src/config/constants";
import { Order } from "src/modules/order/entities/order.entity";

export const listOrderSample: Order[] = [
  {
    user: "ducanh123",
    status: EOrderStatus.CREATED,
    product: "Product 1",
    cardId: "Card id",
    price: 200,
  },
  {
    user: "ducanh123",
    status: EOrderStatus.CREATED,
    product: "Product 2",
    cardId: "Card id",
    price: 200,
  },
];

export const listOrrderSamplerConfirmed: Order[] = [
  {
    user: "ducanh123",
    status: EOrderStatus.CONFIRMED,
    product: "Product 1",
    cardId: "Card id",
    price: 200,
  },
  {
    user: "ducanh123",
    status: EOrderStatus.CONFIRMED,
    product: "Product 2",
    cardId: "Card id",
    price: 200,
  },
];
