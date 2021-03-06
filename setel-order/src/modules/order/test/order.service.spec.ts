import { getQueueToken } from "@nestjs/bull";
import { BadRequestException, ForbiddenException, HttpModule, NotFoundException } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { EOrderStatus } from "src/config/constants";
import { UserSchema, USER_DB } from "src/modules/users/entity/users.entities";
import { PaymentWebhookService } from "src/modules/webhook/payment-webhook.service";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { listOrderSample } from "src/test/helper/order/order.helper";
import { Order, OrderSchema, ORDER_DB } from "../entities/order.entity";
import { OrderController } from "../order.controller";
import { OrderProcessor } from "../order.processor";
import { OrderRepository } from "../order.repository";
import { OrderService } from "../order.service";

describe("OrderService", () => {
  let orderService: OrderService;
  let connection: Connection;
  let moduleRef: TestingModule;

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
    orderService = moduleRef.get<OrderService>(OrderService);
    connection = await moduleRef.get(getConnectionToken());
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

  const createOrder = (order: Order) => {
    const result = orderService.create(order);
    return result;
  };

  describe("Create Order", () => {
    const SampleCreateOrder = listOrderSample[1];
    it("Create order ok", async () => {
      const result = await createOrder(SampleCreateOrder);
      expect(result).toEqual(result);
    });
    it("Create Order Missing field", async () => {
      const order = { ...SampleCreateOrder };
      delete order.cardId;
      expect(orderService.create(order)).rejects.toBeDefined();
    });
  });
  describe("Get Order By Id", () => {
    const SampleCreateOrder = listOrderSample[1];
    it("Get Order ok", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      const result = await orderService.getById({ id: orderCreated._id }).lean();
      expect(result).toBeDefined();
      expect(orderCreated).toMatchObject(result);
    });
  });
  describe("Confirm order", () => {
    const SampleCreateOrder = listOrderSample[1];
    it("Success set to delivery", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      const mock = jest.fn();
      orderService.setToDelivery = mock;
      await orderService.confirmOrder(orderCreated.id, EOrderStatus.CONFIRMED);
      const result = await orderService.getById({ id: orderCreated._id });
      expect(result.status).toEqual(EOrderStatus.CONFIRMED);
      expect(mock).toBeCalledWith(orderCreated.id);
    });
    it("Confirm order canceled be not approve", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      const mock = jest.fn();
      orderService.setToDelivery = mock;
      await orderService.cancelOrder(orderCreated._id, orderCreated.user as any);
      await orderService.confirmOrder(orderCreated._id, EOrderStatus.CONFIRMED);
      const result = await orderService.getById({ id: orderCreated._id });
      expect(result.status).toEqual(EOrderStatus.CANCELLED);
      expect(mock).not.toHaveBeenCalled();
    });
  });
  describe("Cancel Order", () => {
    const SampleCreateOrder = listOrderSample[1];
    it("Success cancel Order", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      await orderService.cancelOrder(orderCreated._id, orderCreated.user as any);
      const result = await orderService.getById({ id: orderCreated._id });
      expect(result.status).toEqual(EOrderStatus.CANCELLED);
    });
    it("Not found order", async () => {
      await expect(orderService.cancelOrder("60eeb284e578bef6ffa959d4", "sample order user" as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
    it("Not modify order of other user", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      await expect(orderService.cancelOrder(orderCreated._id, "Test user 12 3")).rejects.toThrow(ForbiddenException);
    });
    it("Change order bad request", async () => {
      const order = { ...SampleCreateOrder };
      order.status = EOrderStatus.DELIVERED;
      const orderDelivered = await orderService.create(order);
      await expect(orderService.cancelOrder(orderDelivered._id, orderDelivered.user as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      order.status = EOrderStatus.CANCELLED;
      const orderCancelled = await orderService.create(order);
      await expect(orderService.cancelOrder(orderCancelled._id, orderCancelled.user as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
  describe("update order with id", () => {
    const SampleCreateOrder = listOrderSample[1];
    it("Not found order", async () => {
      const order = { ...SampleCreateOrder };
      await expect(
        orderService.updateOrderWithId("60eeb284e578bef6ffa959d4", order, "sample order user" as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
    it("Not modify order of other user", async () => {
      const orderCreated = await createOrder(SampleCreateOrder);
      await expect(orderService.updateOrderWithId(orderCreated._id, orderCreated, "Test user 12 3")).rejects.toThrow(
        ForbiddenException,
      );
    });
    it("Cannot change order with final status", async () => {
      const order = { ...SampleCreateOrder };
      order.status = EOrderStatus.CANCELLED;
      const orderCancelled = await orderService.create(order);
      await expect(
        orderService.updateOrderWithId(orderCancelled._id, orderCancelled, orderCancelled.user as any),
      ).rejects.toThrow(BadRequestException);
      order.status = EOrderStatus.DELIVERED;
      const orderDelivered = await orderService.create(order);
      await expect(
        orderService.updateOrderWithId(orderDelivered._id, orderDelivered, orderDelivered.user as any),
      ).rejects.toThrow(BadRequestException);
      order.status = EOrderStatus.CONFIRMED;
      const orderConfirmed = await orderService.create(order);
      await expect(
        orderService.updateOrderWithId(orderConfirmed._id, orderConfirmed, orderConfirmed.user as any),
      ).rejects.toThrow(BadRequestException);
    });
    it("Chang order to un expected status", async () => {
      const orderCreated = await orderService.create(SampleCreateOrder);
      const orderToBeUpdate = { ...orderCreated };
      orderToBeUpdate.status = EOrderStatus.CONFIRMED;
      await expect(
        orderService.updateOrderWithId(orderCreated._id, orderToBeUpdate, orderCreated.user as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      orderToBeUpdate.status = EOrderStatus.DELIVERED;
      await expect(
        orderService.updateOrderWithId(orderCreated._id, orderToBeUpdate, orderCreated.user as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
    it("Success chang order", async () => {
      const orderToBeUpdate = await orderService.create(SampleCreateOrder);
      orderToBeUpdate.product = Math.random().toString(36).substring(7);
      orderToBeUpdate.cardId = Math.random().toString(36).substring(7);
      orderToBeUpdate.price = Math.random() * 300;
      await orderService.updateOrderWithId(orderToBeUpdate._id, orderToBeUpdate, orderToBeUpdate.user as any);
      const result = await orderService.getById({ id: orderToBeUpdate.id }).lean();
      expect(orderToBeUpdate.product).toEqual(result.product);
      expect(orderToBeUpdate.cardId).toEqual(result.cardId);
      expect(orderToBeUpdate.price).toEqual(result.price);
    });
  });
});
