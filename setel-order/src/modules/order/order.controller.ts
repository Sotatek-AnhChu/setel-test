import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Authorization, Roles } from "src/common/decorators/auth.decorator";
import { ApiQueryGetMany, QueryGet } from "src/common/decorators/common.decorator";
import { ReqUser } from "src/common/decorators/user.decorator";
import { ResponseDTO } from "src/common/dto/response.dto";
import { EOrderStatus, ERole } from "src/config/constants";
import { QueryPostOption } from "src/tools/request.tool";
import { ResponseTool } from "src/tools/response.tool";
import { User } from "../users/users.entities";
import { PaymentWebhookService } from "../webhook/payment-webhook.service";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { UpdateOrderDTO } from "./dto/updatre-order.dto";
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
            user: user.username,
            ...createOrderDTO,
        } as any;
        const orderDocument = await this.orderService.create(order);
        this.paymentWebhookService.makeConfirmOrder(orderDocument);
        return ResponseTool.CREATED(orderDocument);
    }

    @Get("get-my")
    @Roles(ERole.USER)
    @ApiQueryGetMany()
    async getAllOrder(@QueryGet() query: QueryPostOption, @ReqUser() user: User): Promise<ResponseDTO> {
        query.conditions = {
            ...query.conditions,
            user: user.username,
        };
        const { data, total } = await this.orderService.getPagination(query);
        return ResponseTool.GET_OK(data, total);
    }

    @Get("all-status")
    @Roles(ERole.USER)
    async getAllStatus() {
        return ResponseTool.GET_OK(Object.values(EOrderStatus));
    }

    @Get(":id")
    @Roles(ERole.USER)
    async getById(@Param("id") id: string): Promise<ResponseDTO> {
        const result = await this.orderService.getById({ id }).lean();
        if (result == null || result == undefined) {
            throw new NotFoundException(HttpStatus.NOT_FOUND, `Order ${id} not exist !`);
        }
        return ResponseTool.GET_OK(result);
    }

    @Put("/cancel/:id")
    @Roles(ERole.USER)
    async cancelOrder(@Param("id") id: string, @ReqUser() user: User) {
        return ResponseTool.PUT_OK(await this.orderService.cancelOrder(id, user.username));
    }

    @Put(":id")
    @Roles(ERole.USER)
    async updateById(@Param("id") id: string, @Body() updateOrderDTO: UpdateOrderDTO, @ReqUser() user: User) {
        return ResponseTool.PUT_OK(await this.orderService.updateOrderWithId(id, updateOrderDTO as Order, user.username));
    }
}
