import { HttpModule, HttpStatus } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { PaymentModule } from "src/modules/payment/payment.module";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { orderSample } from "src/test/helper/webhook/order-list";
import { OrderWebhookController } from "../order-webhook.controller";
import { OrderWebhookService } from "../order-webhook.service";

describe("Order webhook", () => {
  let moduleRef: TestingModule;
  let orderWebhookController: OrderWebhookController;
  let orderWebhookService: OrderWebhookService;
  let connection: Connection;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), HttpModule, PaymentModule],
      providers: [OrderWebhookService],
      controllers: [OrderWebhookController],
      exports: [OrderWebhookService],
    }).compile();
    connection = await moduleRef.get(getConnectionToken());
    orderWebhookController = moduleRef.get<OrderWebhookController>(OrderWebhookController);
    orderWebhookService = moduleRef.get<OrderWebhookService>(OrderWebhookService);
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

  it("Should be define", () => {
    expect(orderWebhookController).toBeDefined();
  });
  describe("confirmOrder", () => {
    it("Put ok", async () => {
      const order = orderSample[0];
      const mockConfirmOrder = jest.spyOn(orderWebhookService, "confirmOrder").mockImplementation(async () => {
        return;
      });
      const result = await orderWebhookController.makeConfirm(order);
      expect(mockConfirmOrder).toBeCalledWith(order);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });
  });
  describe("makeRefund", () => {
    it("Put ok", async () => {
      const id = orderSample[0]._id;
      const mockMakeRefund = jest.spyOn(orderWebhookService, "makeRefund").mockImplementation(async () => {
        return;
      });
      const result = await orderWebhookController.makeRefund(id);
      expect(mockMakeRefund).toBeCalledWith(id);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });
  });
});
