import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Authorization, Roles } from "src/common/decorators/auth.decorator";
import { ReqUser } from "src/common/decorators/user.decorator";
import { ResponseDTO } from "src/common/dto/response.dto";
import { ERole } from "src/config/constants";
import { ResponseTool } from "src/tools/response.tool";
import { User } from "../users/entity/users.entities";
import { PaymentWebhookService } from "../webhook/payment-webhook.service";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { UpdateOrderDTO } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";

@Controller("order")
@Authorization()
@ApiTags("Order")
export class OrderController {
  constructor(private readonly orderService: OrderService, private readonly paymentWebhookService: PaymentWebhookService) {}

  @Post()
  @Roles(ERole.USER)
  async createOrder(@Body() createOrderDTO: CreateOrderDTO, @ReqUser() user: User) {
    const order: Order = {
      ...createOrderDTO,
      user: user.username,
    } as any;
    const orderDocument = await this.orderService.create(order);
    this.paymentWebhookService.makeConfirmOrder(orderDocument);
    return ResponseTool.CREATED(orderDocument);
  }

  @Get("get-my")
  @Roles(ERole.USER)
  async getAllMyOrder(@ReqUser("username") username: string): Promise<ResponseDTO> {
    const data = await this.orderService.getAll({
      conditions: {
        user: username,
      },
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });
    return ResponseTool.GET_OK(data);
  }

  @Put("/cancel/:id")
  @Roles(ERole.USER)
  async cancelOrder(@Param("id") id: string, @ReqUser() user: User) {
    return ResponseTool.PUT_OK(await this.orderService.cancelOrder(id, user.username));
  }

  @Put(":id")
  @Roles(ERole.USER)
  async updateById(@Param("id") id: string, @Body() updateOrderDTO: UpdateOrderDTO, @ReqUser("username") username: string) {
    return ResponseTool.PUT_OK(await this.orderService.updateOrderWithId(id, updateOrderDTO as Order, username));
  }
}
