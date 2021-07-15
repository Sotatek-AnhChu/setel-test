import { ApiProperty } from "@nestjs/swagger";
import { Allow } from "class-validator";

export class OrderDTO {
  @Allow()
  @ApiProperty()
  _id: string;

  @Allow()
  @ApiProperty()
  user: string;

  @Allow()
  @ApiProperty()
  status: string;

  @Allow()
  @ApiProperty()
  product: string;

  @Allow()
  @ApiProperty()
  cardId: string;

  @Allow()
  @ApiProperty()
  price: string;
}
