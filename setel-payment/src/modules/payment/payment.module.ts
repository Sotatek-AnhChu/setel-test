import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentSchema, PAYMENT_DB } from "./entities/payment.entity";
import { PaymentService } from "./payment.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: PAYMENT_DB,
                schema: PaymentSchema,
            },
        ]),
    ],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule {}
