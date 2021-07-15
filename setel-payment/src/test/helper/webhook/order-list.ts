import { OrderDTO } from "src/modules/webhook/dto/order.dto";

export const orderSample: OrderDTO[] = [
  {
    _id: "60ee4422c56b5720f67f654b",
    user: "username",
    status: "CREATED",
    cardId: "123",
    price: "Test",
    product: "Pro",
  },
];
