import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { ApiCommonErrors } from "../../common/decorators/common.decorator";
import { UserDocument } from "../users/entity/users.entities";
import { AuthService } from "./auth.service";
import { AccessTokenResponse } from "./dto/access-token-response.dto";
import { AuthDTO } from "./dto/auth.dto";
import { LoginResponseDTO } from "./dto/login-response.dto";
import { RefreshTokenDTO } from "./dto/refresh-token.dto";

@Controller("auth")
@ApiTags("Auth")
@ApiCommonErrors()
export class Authentication {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  @ApiOkResponse({ type: LoginResponseDTO })
  @ApiBody({ type: AuthDTO })
  async login(@Req() req: Request): Promise<LoginResponseDTO> {
    return await this.authService.login(req.user as UserDocument);
  }

  @Post("access-token")
  @ApiResponse({ type: AccessTokenResponse })
  async getAccessToken(@Body() refreshTokenDTO: RefreshTokenDTO): Promise<AccessTokenResponse> {
    return await this.authService.signAccessToken(refreshTokenDTO.refreshToken);
  }
}
