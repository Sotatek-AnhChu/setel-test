import { OmitType, PartialType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";

export class CreateOrderDTO extends PartialType(OmitType(Order, ["user", "status"])) {}
