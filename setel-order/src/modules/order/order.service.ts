import { InjectQueue } from "@nestjs/bull";
import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Queue } from "bull";
import { EOrderStatus } from "src/config/constants";
import { QueryPostOption } from "src/tools/request.tool";
import { Order, OrderDocument } from "./entities/order.entity";
import { CONFIRMED_EVENT_NAME } from "./order.processor";
import { OrderRepository } from "./order.repository";

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        @InjectQueue("ORDER_QUEUE")
        private readonly orderQueue: Queue,
    ) {}

    async create(order: Order) {
        return this.orderRepository.create(order);
    }

    async getPagination(query: QueryPostOption) {
        return this.orderRepository.getPagination(query);
    }

    getById({ id }: { id: string }) {
        return this.orderRepository.getById({ id });
    }

    async confirmOrder(id: string, status: EOrderStatus) {
        const order = await this.orderRepository
            .updateOne({
                conditions: {
                    _id: id,
                    status: EOrderStatus.CREATED,
                },
                update: {
                    status,
                },
                options: {
                    new: true,
                },
            })
            .exec();
        if (order != null && order != undefined) {
            if (order.status == EOrderStatus.CONFIRMED) {
                this.setToDelivery(id);
            }
        }
    }

    async setToDelivery(id: string) {
        this.orderQueue.add(CONFIRMED_EVENT_NAME, id, {
            delay: 20000,
            timeout: 3000,
        });
    }

    async cancelOrder(idOrder: string, username: string): Promise<any> {
        const oldOrder = await this.orderRepository.getById({ id: idOrder }).exec();
        if (oldOrder == null || oldOrder == undefined) {
            throw new NotFoundException(HttpStatus.NOT_FOUND, "Cannot find order with this id");
        }
        if ((oldOrder as OrderDocument).user != username) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Not same username");
        }
        if (oldOrder.status === EOrderStatus.CONFIRMED || oldOrder.status === EOrderStatus.CREATED) {
            oldOrder.status = EOrderStatus.CANCELLED;
            oldOrder.save();
            return oldOrder;
        }
        throw new BadRequestException(HttpStatus.BAD_REQUEST, `Cannot change order with ${oldOrder.status} status`);
    }

    async updateOrderWithId(id: string, order: Order, username: string): Promise<OrderDocument> {
        const oldOrder = await this.orderRepository.getById({ id }).lean().exec();
        if (oldOrder == null || oldOrder == undefined) {
            throw new NotFoundException(HttpStatus.NOT_FOUND, "Cannot find order with this id");
        }
        if ((oldOrder as OrderDocument).user != username) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Not same username");
        }
        order = {
            ...oldOrder,
            ...order,
        };
        if (
            oldOrder.status == EOrderStatus.CANCELLED ||
            oldOrder.status == EOrderStatus.DELIVERED ||
            oldOrder.status == EOrderStatus.CONFIRMED
        ) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, `Cannot change order with ${oldOrder.status} status`);
        }

        if (order.status == EOrderStatus.DELIVERED || order.status == EOrderStatus.CONFIRMED) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, `Cannot change order to ${order.status} status`);
        }
        if (Object.values(EOrderStatus).indexOf(order.status) < 0) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Status not valid");
        }
        return this.orderRepository.updateById({
            id,
            update: order,
            options: {
                new: true,
            },
        });
    }
}
