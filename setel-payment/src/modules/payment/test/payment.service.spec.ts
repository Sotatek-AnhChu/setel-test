import { getConnectionToken, getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection, Model } from "mongoose";
import { EPaymentStatus } from "src/config/constants";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { Payment, PaymentDocument, PaymentSchema, PAYMENT_DB } from "../entities/payment.entity";
import { PaymentService } from "../payment.service";

describe("PaymentService", () => {
    let service: PaymentService;
    let connection: Connection;
    let moduleRef: TestingModule;
    let model: Model<PaymentDocument>;
    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MongooseModule.forFeature([
                    {
                        name: PAYMENT_DB,
                        schema: PaymentSchema,
                    },
                ]),
            ],
            providers: [PaymentService],
            exports: [PaymentService],
        }).compile();
        service = moduleRef.get<PaymentService>(PaymentService);
        connection = await moduleRef.get(getConnectionToken());
        model = await moduleRef.get(getModelToken(PAYMENT_DB));
    });
    afterEach(async () => {
        await clearMongodb(connection);
    });

    afterAll(async (done) => {
        await connection.close();
        await closeInMongodConnection();
        await moduleRef.close();
        done();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("Refund payment", () => {
        it("Refund ok", async () => {
            const paymentBeCreated: Payment = {
                orderId: "test id",
                cardId: "Test id",
                status: EPaymentStatus.VALID,
            };
            const payment = await model.create(paymentBeCreated);
            const paymentRefund = await service.refundPayment(payment.orderId);
            expect(paymentRefund).toMatchObject({
                status: EPaymentStatus.REFUND,
            });
        });
    });
});
