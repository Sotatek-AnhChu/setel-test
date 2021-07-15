import { BullModule } from "@nestjs/bull";
import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config/secrets";
import { PaymentWebhookService } from "../webhook/payment-webhook.service";
import { OrderSchema, ORDER_DB } from "./entities/order.entity";
import { OrderController } from "./order.controller";
import { OrderProcessor } from "./order.processor";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ORDER_QUEUE",
      redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
      },
    }),
    MongooseModule.forFeature([{ name: ORDER_DB, schema: OrderSchema }]),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderProcessor, OrderService, PaymentWebhookService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
