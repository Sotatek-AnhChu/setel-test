import { HttpService, Injectable } from "@nestjs/common";
import { EPaymentStatus } from "src/config/constants";
import { ORDER_SERVICE_CONFIRM } from "src/config/end-point";
import { APIKEY } from "src/config/secrets";
import { Payment } from "../payment/entities/payment.entity";
import { PaymentService } from "../payment/payment.service";
import { OrderDTO } from "./dto/order.dto";

interface PaymentResponseOrder {
  isConfirmed: boolean;
}

@Injectable()
export class OrderWebhookService {
  constructor(private readonly httpService: HttpService, private readonly paymentService: PaymentService) {}

  async waitSomeTime(time: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  async confirmOrder(order: OrderDTO) {
    await this.waitSomeTime(5000); // Mock waiting time for demo.
    const isConfirmed = Math.random() > 0.5 ? false : true;
    this.paymentService.create({
      orderId: order._id,
      cardId: order.cardId,
      status: isConfirmed ? EPaymentStatus.VALID : EPaymentStatus.INVALID,
    } as Payment);
    this.httpService
      .put(
        `${ORDER_SERVICE_CONFIRM}/${order._id}`,
        {
          isConfirmed,
        } as PaymentResponseOrder,
        {
          headers: {
            "api-key": APIKEY,
          },
        },
      )
      .toPromise()
      .catch((e) => {
        console.error(e);
      });
  }

  async makeRefund(id: string) {
    this.paymentService.refundPayment(id);
  }
}
