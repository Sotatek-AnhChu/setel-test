import { OmitType, PartialType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";
import { OrderDTO } from "./order.dto";

export class UpdateOrderDTO extends PartialType(OmitType(OrderDTO, ["user"])) {}
