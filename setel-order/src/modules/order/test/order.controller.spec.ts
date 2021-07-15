import { BullModule } from "@nestjs/bull";
import { HttpModule, HttpStatus } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config/secrets";
import { UserSchema, USER_DB } from "src/modules/users/users.entities";
import { PaymentWebhookService } from "src/modules/webhook/payment-webhook.service";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { orderSample } from "src/test/helper/order/order.helper";
import { createdUser } from "src/test/helper/user/user.helper";
import { Order, OrderDocument, OrderSchema, ORDER_DB } from "../entities/order.entity";
import { OrderController } from "../order.controller";
import { OrderProcessor } from "../order.processor";
import { OrderRepository } from "../order.repository";
import { OrderService } from "../order.service";

describe("Order Controller", () => {
  let orderService: OrderService;
  let orderController: OrderController;
  let connection: Connection;
  let moduleRef: TestingModule;
  let paymentWebhookService: PaymentWebhookService;

  beforeAll(async (done) => {
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

  afterEach(async () => {
    await clearMongodb(connection);
    jest.resetModules();
  });

  afterAll(async (done) => {
    await connection.close();
    await closeInMongodConnection();
    await moduleRef.close();
    done();
  });

  it("Order Controller be define", () => {
    expect(orderController).toBeDefined();
  });
  it("Create order", async () => {
    const SampleCreateOrder = orderSample[0];
    const order: Order = {
      ...SampleCreateOrder,
      user: createdUser.username,
    };
    const mockCreateOrder = jest.fn(
      (): Promise<OrderDocument> => {
        return Promise.resolve(order as OrderDocument);
      },
    );
    const mockPaymentWebHook = jest.fn(
      (): Promise<void> => {
        return;
      },
    );
    jest.spyOn(orderService, "create").mockImplementation(mockCreateOrder);
    jest.spyOn(paymentWebhookService, "makeConfirmOrder").mockImplementation(mockPaymentWebHook);
    const result = await orderController.createOrder(order, createdUser);
    expect(mockCreateOrder).toBeCalledWith(order);
    expect(mockPaymentWebHook).toBeCalledWith(order);
    expect(result.data).toEqual(order);
  });

  it("Get my", async () => {
    const mockGetAll = jest.spyOn(orderService, "getAll").mockImplementation(
      async (): Promise<OrderDocument[]> => {
        return Promise.resolve(orderSample as OrderDocument[]);
      },
    );
    const username = orderSample[0].user.toString();
    const toBeCallObject = {
      conditions: {
        user: username,
      },
      options: {
        sort: {
          createdAt: -1,
        },
      },
    };
    const result = await orderController.getAllMyOrder(username);
    expect(mockGetAll).toBeCalledWith(toBeCallObject);
    expect(result.data).toEqual(orderSample);
    expect(result.statusCode).toEqual(HttpStatus.OK);
  });
  it("Update order", async () => {
    const sampleOrder = orderSample[0];
    const username = sampleOrder.user.toString();
    const uuidTesting = "60efb4666048dc7a39db65ce";
    const mockUpdate = jest.spyOn(orderService, "updateOrderWithId").mockImplementation(() => {
      return Promise.resolve(sampleOrder as OrderDocument);
    });

    const result = await orderController.updateById(uuidTesting, sampleOrder, username);
    expect(mockUpdate).toBeCalledWith(uuidTesting, sampleOrder, username);
    expect(result.data).toEqual(sampleOrder);
    expect(result.statusCode).toEqual(HttpStatus.OK);
  });
});
