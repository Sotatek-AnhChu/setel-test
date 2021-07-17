import { OmitType, PartialType } from "@nestjs/swagger";
import { OrderDTO } from "./order.dto";

export class CreateOrderDTO extends PartialType(OmitType(OrderDTO, ["user", "status"])) {}
