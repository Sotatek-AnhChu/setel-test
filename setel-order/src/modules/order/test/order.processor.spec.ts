import { getQueueToken } from "@nestjs/bull";
import { HttpModule } from "@nestjs/common";
import { getConnectionToken, getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { DoneCallback, Job } from "bull";
import { Connection, Model } from "mongoose";
import { EOrderStatus } from "src/config/constants";
import { UserSchema, USER_DB } from "src/modules/users/entity/users.entities";
import { PaymentWebhookService } from "src/modules/webhook/payment-webhook.service";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { listOrrderSamplerConfirmed } from "src/test/helper/order/order.helper";
import { OrderDocument, OrderSchema, ORDER_DB } from "../entities/order.entity";
import { OrderController } from "../order.controller";
import { OrderProcessor } from "../order.processor";
import { OrderRepository } from "../order.repository";
import { OrderService } from "../order.service";

describe("OrderProcessor", () => {
  let connection: Connection;
  let moduleRef: TestingModule;
  let orderProcessor: OrderProcessor;
  let orderModel: Model<OrderDocument>;
  let paymentWebhookService: PaymentWebhookService;
  const queueMockProvider = {
    add: jest.fn().mockImplementation(() => {
      return;
    }),
  };

  beforeAll(async (done) => {
    moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: ORDER_DB, schema: OrderSchema },
          { name: USER_DB, schema: UserSchema },
        ]),
        HttpModule,
      ],
      controllers: [OrderController],
      providers: [
        OrderProcessor,
        OrderService,
        PaymentWebhookService,
        OrderRepository,
        {
          provide: getQueueToken("ORDER_QUEUE"),
          useValue: queueMockProvider,
        },
      ],
      exports: [OrderService],
    }).compile();
    orderModel = await moduleRef.get(getModelToken(ORDER_DB));
    orderProcessor = moduleRef.get<OrderProcessor>(OrderProcessor);
    connection = await moduleRef.get(getConnectionToken());
    paymentWebhookService = moduleRef.get<PaymentWebhookService>(PaymentWebhookService);
    done();
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
  it("Should be define", async () => {
    expect(orderProcessor).toBeDefined();
  });

  describe("handleConfirmedEvent", () => {
    it("Order be delivered", async () => {
      const orderConfirmed = await orderModel.create(listOrrderSamplerConfirmed[0]);
      const done: DoneCallback = jest.fn().mockImplementation(() => {
        return;
      });
      const job: Job<string> = {
        data: orderConfirmed._id,
      } as Job<string>;
      orderModel.findByIdAndUpdate = jest.fn().mockImplementation(() => {
        return {
          exec: jest.fn(),
        };
      });
      await orderProcessor.handleConfirmedEvent(job, done);
      expect(done).toBeCalledWith(null, "Success");
      expect(orderModel.findByIdAndUpdate).toBeCalledWith(orderConfirmed._id, {
        status: EOrderStatus.DELIVERED,
      });
    });
    it("Order cannot be deliverd by order being canceled", async () => {
      const orderCanceled = await orderModel.create({
        ...listOrrderSamplerConfirmed[0],
        status: EOrderStatus.CANCELLED,
      });
      const done: DoneCallback = jest.fn().mockImplementation(() => {
        return;
      });
      const mockMakeRefundOrder = jest.spyOn(paymentWebhookService, "makeRefundOrder").mockImplementation(
        (): Promise<any> => {
          return;
        },
      );
      const job: Job<string> = {
        data: orderCanceled._id,
      } as Job<string>;

      await orderProcessor.handleConfirmedEvent(job, done);
      expect(done).toBeCalledWith(null, "Has been cancelled");
      expect(mockMakeRefundOrder).toHaveBeenCalled();
    });
  });
});
