import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiHeader, ApiTags } from "@nestjs/swagger";
import { ResponseTool } from "src/tools/response.tool";
import { OrderDTO } from "./dto/order.dto";
import { OrderWebhookService } from "./order-webhook.service";

@Controller("webhook/order")
@ApiTags("Webhook Order")
export class OrderWebhookController {
  constructor(private readonly orderWebhookService: OrderWebhookService) {}

  @Put("make-confirm")
  @ApiHeader({
    name: "api-key",
    description: "Api key",
  })
  async makeConfirm(@Body() order: OrderDTO) {
    await this.orderWebhookService.confirmOrder(order);
    return ResponseTool.PUT_OK("OK");
  }

  @Put("make-refund/:id")
  @ApiHeader({
    name: "api-key",
    description: "Api key",
  })
  async makeRefund(@Param("id") id: string) {
    this.orderWebhookService.makeRefund(id);
    return ResponseTool.PUT_OK("OK");
  }
}
