import { EOrderStatus } from "src/config/constants";
import { Order } from "src/modules/order/entities/order.entity";

export const SampleCreateOrder: Order = {
    user: "Test user id",
    status: EOrderStatus.CREATED,
    product: "Product 1",
    cardId: "Card id",
    price: 200,
};
