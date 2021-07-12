import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { EPaymentStatus } from "src/config/constants";
import { Document } from "mongoose";
import * as mongoose from "mongoose";

export const PAYMENT_DB = "payment";

@Schema({
    collection: PAYMENT_DB,
    timestamps: true,
    validateBeforeSave: true,
})
export class Payment {
    @Prop({
        unique: true,
    })
    orderId: string;

    @Prop()
    cardId: string;

    @Prop({
        type: mongoose.Schema.Types.String,
        enum: Object.values(EPaymentStatus),
        required: true,
    })
    status: EPaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({
    orderId: 1,
});
export interface PaymentDocument extends Payment, Document {}
