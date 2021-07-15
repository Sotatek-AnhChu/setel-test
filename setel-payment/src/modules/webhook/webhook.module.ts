import { HttpModule, Module } from "@nestjs/common";
import { PaymentModule } from "../payment/payment.module";
import { OrderWebhookController } from "./order-webhook.controller";
import { OrderWebhookService } from "./order-webhook.service";

@Module({
    imports: [HttpModule, PaymentModule],
    providers: [OrderWebhookService],
    controllers: [OrderWebhookController],
    exports: [OrderWebhookService],
})
export class WebhookModule {}
