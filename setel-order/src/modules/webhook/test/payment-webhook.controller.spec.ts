import { HttpModule, HttpStatus } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { OrderSchema, ORDER_DB } from "../../order/entities/order.entity";
import { OrderModule } from "../../order/order.module";
import { OrderService } from "../../order/order.service";
import { PaymentWebhookController } from "../payment-webhook.controller";
import { PaymentWebhookService } from "../payment-webhook.service";
import { PaymentResponseOrder } from "../payment-webhook.controller";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { EOrderStatus } from "src/config/constants";
import { Connection } from "mongoose";

describe("Payment webhook", () => {
    let moduleRef: TestingModule;
    let orderService: OrderService;
    let paymentWebhookController: PaymentWebhookController;
    let connection: Connection;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                HttpModule,
                MongooseModule.forFeature([{ name: ORDER_DB, schema: OrderSchema }]),
                OrderModule,
            ],
            controllers: [PaymentWebhookController],
            providers: [PaymentWebhookService],
        }).compile();
        orderService = moduleRef.get<OrderService>(OrderService);
        paymentWebhookController = moduleRef.get<PaymentWebhookController>(PaymentWebhookController);
        connection = await moduleRef.get(getConnectionToken());
    });

    afterAll(async (done) => {
        await connection.close();
        await closeInMongodConnection();
        done();
    });

    afterEach(async () => {
        await clearMongodb(connection);
    });

    describe("Confirm order", () => {
        it("Set order to confirm", async () => {
            const response: PaymentResponseOrder = {
                isConfirmed: true,
            };
            const mockConfirmOrder = jest.spyOn(orderService, "confirmOrder").mockImplementation(
                (): Promise<void> => {
                    return;
                },
            );
            const idTesting = "Test";
            const result = await paymentWebhookController.confirm(response, idTesting);
            expect(mockConfirmOrder).toBeCalledWith(idTesting, EOrderStatus.CONFIRMED);
            expect(result.statusCode).toEqual(HttpStatus.OK);
        });

        it("Set order to cancel", async () => {
            const response: PaymentResponseOrder = {
                isConfirmed: false,
            };
            const mockConfirmOrder = jest.spyOn(orderService, "confirmOrder").mockImplementation(
                (): Promise<void> => {
                    return;
                },
            );
            const idTesting = "Test";
            const result = await paymentWebhookController.confirm(response, idTesting);
            expect(mockConfirmOrder).toBeCalledWith(idTesting, EOrderStatus.CANCELLED);
            expect(result.statusCode).toEqual(HttpStatus.OK);
        });
    });
});
