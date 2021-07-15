import { BullModule } from "@nestjs/bull";
import { HttpModule } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config/secrets";
import { rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { UserSchema, USER_DB } from "../users/users.entities";
import { PaymentWebhookService } from "../webhook/payment-webhook.service";
import { OrderSchema, ORDER_DB } from "./entities/order.entity";
import { OrderController } from "./order.controller";
import { OrderProcessor } from "./order.processor";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";

describe("Order Controller", () => {
    let orderService: OrderService;
    let orderController: OrderController;
    let connection: Connection;
    let moduleRef: TestingModule;
    let paymentWebhookService: PaymentWebhookService;

    beforeEach(async (done) => {
        moduleRef = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                BullModule.registerQueue({
                    name: "ORDER_QUEUE",
                    redis: {
                        host: REDIS_HOST,
                        port: REDIS_PORT,
                        password: REDIS_PASSWORD,
                    },
                }),
                MongooseModule.forFeature([
                    { name: ORDER_DB, schema: OrderSchema },
                    { name: USER_DB, schema: UserSchema },
                ]),
                HttpModule,
            ],
            controllers: [OrderController],
            providers: [OrderProcessor, OrderService, PaymentWebhookService, OrderRepository],
            exports: [OrderService],
        }).compile();
        orderService = moduleRef.get<OrderService>(OrderService);
        orderController = moduleRef.get<OrderController>(OrderController);
        paymentWebhookService = moduleRef.get<PaymentWebhookService>(PaymentWebhookService);
        connection = await moduleRef.get(getConnectionToken());
        done();
    });
});
