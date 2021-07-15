import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiHeader, ApiTags } from "@nestjs/swagger";
import { EOrderStatus } from "src/config/constants";
import { ResponseTool } from "src/tools/response.tool";
import { OrderService } from "../order/order.service";

export interface PaymentResponseOrder {
    isConfirmed: boolean;
}

@Controller("webhook/payment")
@ApiTags("Webhook payment")
export class PaymentWebhookController {
    constructor(private readonly orderService: OrderService) {}

    @Put("confirm/:id")
    @ApiHeader({
        name: "api-key",
        description: "Api key",
    })
    async confirm(@Body() result: PaymentResponseOrder, @Param("id") id: string) {
        const { isConfirmed } = result;
        const orderStatus = isConfirmed == true ? EOrderStatus.CONFIRMED : EOrderStatus.CANCELLED;
        this.orderService.confirmOrder(id, orderStatus);
        return ResponseTool.PUT_OK("OK");
    }
}
