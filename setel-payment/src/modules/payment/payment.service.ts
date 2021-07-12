import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "src/common/base/base.service";
import { EPaymentStatus } from "src/config/constants";
import { PaymentDocument, PAYMENT_DB } from "./entities/payment.entity";

@Injectable()
export class PaymentService extends BaseService<PaymentDocument> {
    constructor(
        @InjectModel(PAYMENT_DB)
        private readonly paymentModel: Model<PaymentDocument>,
    ) {
        super(paymentModel);
    }

    async refundPayment(orderId: string) {
        this.paymentModel
            .findOneAndUpdate(
                {
                    orderId,
                },
                {
                    status: EPaymentStatus.REFUND,
                },
            )
            .exec();
    }
}
