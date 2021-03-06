import { forwardRef, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ObjectID } from "mongodb";
import { MSG } from "../../config/constants";
import { ACCESS_TOKEN_EXP, JWT_SECRET, REFRESH_TOKEN_EXP } from "../../config/secrets";
import { AuthToolService } from "../tool/auth-tool/auth-tool.service";
import { User, UserDocument } from "../users/entity/users.entities";
import { UsersService } from "../users/users.service";
import { AccessTokenResponse } from "./dto/access-token-response.dto";
import { LoginResponseDTO } from "./dto/login-response.dto";
import { PayloadDTO } from "./dto/payload.dto";

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger("Auth");
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authToolService: AuthToolService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserDocument> {
    const user = await this.userService.findByUsernameOrEmail(username);
    if (user) {
      // Check Password
      const usePassword = await user.comparePassword(pass);
      if (usePassword) {
        return user;
      }
      throw new UnauthorizedException(AuthService.name, MSG.FRONTEND.AUTH_FAILED_WRONG_PASSWORD);
    }
    throw new UnauthorizedException(AuthService.name, MSG.FRONTEND.AUTH_FAILED_USERNAME_NOT_EXIST);
  }

  async login(user: UserDocument, timestamp: number = Date.now()): Promise<LoginResponseDTO> {
    const jti = new ObjectID().toHexString();
    const payload = {
      sub: user._id,
      jti,
    } as PayloadDTO;
    this.logger.verbose(`LOGIN: ${user.username} ${user._id} ${user.fullName}`);
    this.authToolService.setJWTKey(user._id, jti, REFRESH_TOKEN_EXP, timestamp);
    return {
      user,
      refreshToken: this.jwtService.sign(payload),
    };
  }

  async signAccessToken(refreshToken: string): Promise<AccessTokenResponse> {
    try {
      this.jwtService.verify(refreshToken);
    } catch (e) {
      throw new UnauthorizedException(AuthService.name, "Invalid token");
    }
    const refreshPayload: PayloadDTO = this.jwtService.decode(refreshToken) as PayloadDTO;
    if (!(await this.authToolService.checkJWTKey(refreshPayload.sub, refreshPayload.jti))) {
      throw new UnauthorizedException(AuthService.name, "Token expried");
    }
    const user = (await this.userService.findById(refreshPayload.sub)) as User;
    const accessToken = this.jwtService.sign(user, {
      expiresIn: ACCESS_TOKEN_EXP,
      secret: JWT_SECRET,
    });
    return {
      user,
      accessToken,
    };
  }
}
