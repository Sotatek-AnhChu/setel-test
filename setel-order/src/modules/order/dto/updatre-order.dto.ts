import { OmitType, PartialType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";

export class UpdateOrderDTO extends PartialType(OmitType(Order, ["user"])) {}
