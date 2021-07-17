import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsDefined, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import { EOrderStatus } from "src/config/constants";
import { User, USER_DB } from "src/modules/users/users.entities";

export const ORDER_DB = "order";

@Schema({
  collection: ORDER_DB,
  timestamps: true,
  toJSON: { virtuals: true },
  collation: { locale: "vi" },
  validateBeforeSave: true,
})
export class Order {
  @Prop({
    type: mongoose.Schema.Types.String,
    ref: USER_DB,
    refPath: "username",
  })
  user: string | User;

  @Prop({
    type: mongoose.Schema.Types.String,
    enum: Object.values(EOrderStatus),
    default: EOrderStatus.CREATED,
  })
  status: EOrderStatus;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  product: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Prop({
    required: true,
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export interface OrderDocument extends Order, Document {}
