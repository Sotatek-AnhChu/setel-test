import { HttpService, Injectable } from "@nestjs/common";
import { PAYMENT_SERVICE_MAKE_CONFIRM, PAYMENT_SERVICE_MAKE_REFUND } from "src/config/end-point";
import { APIKEY } from "src/config/secrets";
import { Order, OrderDocument } from "../order/entities/order.entity";

@Injectable()
export class PaymentWebhookService {
    constructor(private readonly httpService: HttpService) {}

    async makeConfirmOrder(order: Order) {
        this.httpService
            .request({
                url: PAYMENT_SERVICE_MAKE_CONFIRM,
                method: "PUT",
                headers: {
                    "api-key": APIKEY,
                },
                data: order,
            })
            .toPromise()
            .catch((e) => {
                console.error(e);
            });
    }

    async makeRefundOrder(order: Order) {
        return this.httpService
            .request({
                url: `${PAYMENT_SERVICE_MAKE_REFUND}/${(order as OrderDocument)._id}`,
                method: "PUT",
                headers: {
                    "api-key": APIKEY,
                },
                data: order,
            })
            .toPromise();
    }
}
