import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Authorization, Roles } from "../../common/decorators/auth.decorator";
import { ApiCommonErrors, ApiQueryGetMany, QueryGet } from "../../common/decorators/common.decorator";
import { ReqUser } from "../../common/decorators/user.decorator";
import { ResponseDTO } from "../../common/dto/response.dto";
import { ERole } from "../../config/constants";
import { QueryPostOption } from "../../tools/request.tool";
import { ResponseTool } from "../../tools/response.tool";
import { GetUserDTO } from "./dto/get-user.dto";
import { RegisterUserDTO } from "./dto/register-user.dto";
import { User } from "./users.entities";
import { UsersService } from "./users.service";

@Controller("/users")
@ApiCommonErrors()
@ApiTags("Users")
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    @Authorization()
    @Roles(ERole.ADMIN)
    @ApiOkResponse({ type: ResponseDTO })
    @ApiQueryGetMany()
    async findAll(@QueryGet() query: QueryPostOption): Promise<ResponseDTO> {
        const data = await this.userService.findAll(query.options, query.conditions);
        const total = await this.userService.count(query.conditions);
        return ResponseTool.GET_OK(data, total);
    }

    @Get("my/profile")
    @Authorization()
    @ApiOkResponse({ type: ResponseDTO })
    async getMyProfile(@ReqUser("_id") userId: string): Promise<ResponseDTO> {
        const data = await this.userService.findById(userId);
        return ResponseTool.GET_OK(data);
    }

    @Post("/register")
    @ApiCreatedResponse({ type: GetUserDTO })
    async create(@Body() user: RegisterUserDTO): Promise<User> {
        return await this.userService.createUser(user as User);
    }
}
