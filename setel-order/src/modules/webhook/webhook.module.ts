import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderSchema, ORDER_DB } from "../order/entities/order.entity";
import { OrderModule } from "../order/order.module";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { PaymentWebhookService } from "./payment-webhook.service";

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: ORDER_DB, schema: OrderSchema }]), OrderModule],
  controllers: [PaymentWebhookController],
  providers: [PaymentWebhookService],
})
export class WebhookModule {}
