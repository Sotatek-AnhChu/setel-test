import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { EOrderStatus } from "src/config/constants";
import { User } from "src/modules/users/users.entities";

export class OrderDTO {
  @ApiProperty({
    type: String,
    required: true,
  })
  user: string | User;

  @ApiProperty({
    type: String,
  })
  status: EOrderStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  product: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @Min(0)
  price: number;
}
