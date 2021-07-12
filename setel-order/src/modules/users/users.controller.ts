import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Authorization, Roles } from "../../common/decorators/auth.decorator";
import { ApiCommonErrors, ApiQueryGetMany, QueryGet } from "../../common/decorators/common.decorator";
import { ReqUser } from "../../common/decorators/user.decorator";
import { DeleteResultDTO } from "../../common/dto/delete-result.dto";
import { ResponseDTO } from "../../common/dto/response.dto";
import { ERole } from "../../config/constants";
import { QueryPostOption } from "../../tools/request.tool";
import { ResponseTool } from "../../tools/response.tool";
import { UploadTool } from "../../tools/upload.tool";
import { GetUserDTO } from "./dto/get-user.dto";
import { RegisterUserDTO } from "./dto/register-user.dto";
import { UpdateMyUserDTO } from "./dto/update-my-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
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
        const data = await this.userService.getProfile(userId);
        console.log(data);
        return ResponseTool.GET_OK(data);
    }

    @Get(":id")
    @Authorization()
    @Roles(ERole.ADMIN)
    @ApiOkResponse({ type: ResponseDTO })
    async findById(@Param("id") id: string): Promise<ResponseDTO> {
        return ResponseTool.GET_OK(await this.userService.findById(id));
    }

    @Post("/register")
    @ApiCreatedResponse({ type: GetUserDTO })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("anhDaiDien", UploadTool.imageUpload))
    async create(@Body() user: RegisterUserDTO, @UploadedFile() anhDaiDien: Express.Multer.File): Promise<User> {
        return await this.userService.createUser(user as User, anhDaiDien);
    }

    @Put(":id")
    @ApiOkResponse({ type: GetUserDTO })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("anhDaiDien", UploadTool.imageUpload))
    @Authorization()
    @Roles(ERole.ADMIN)
    async updateById(
        @Param("id") id: string,
        @Body() user: UpdateUserDTO,
        @UploadedFile() anhDaiDien: Express.Multer.File,
    ): Promise<User> {
        return await this.userService.updateByIdUser(id, user as User, anhDaiDien);
    }

    @Put("my/profile")
    @ApiOkResponse({ type: GetUserDTO })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("anhDaiDien", UploadTool.imageUpload))
    @Authorization()
    async updateMyUser(
        @Body() user: UpdateMyUserDTO,
        @UploadedFile() anhDaiDien: Express.Multer.File,
        @ReqUser("_id") userId: string,
    ): Promise<User> {
        return await this.userService.updateByIdUser(userId, user as User, anhDaiDien);
    }

    @Delete("username/:username")
    @Authorization()
    @Roles(ERole.ADMIN)
    @ApiOkResponse({ type: DeleteResultDTO })
    async deleteByUsername(@Param("username") username: string): Promise<DeleteResultDTO> {
        return await this.userService.deleteByUsername(username);
    }

    @Delete(":id")
    @Authorization()
    @Roles(ERole.ADMIN)
    @ApiOkResponse({ type: DeleteResultDTO })
    async deleteById(@Param("id") id: string): Promise<DeleteResultDTO> {
        return await this.userService.deleteByIdUser(id);
    }
}
