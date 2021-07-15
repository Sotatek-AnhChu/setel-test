import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/common/repository/base.repository";
import { OrderDocument, ORDER_DB } from "./entities/order.entity";

@Injectable()
export class OrderRepository extends BaseRepository<OrderDocument> {
  constructor(
    @InjectModel(ORDER_DB)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }
}
