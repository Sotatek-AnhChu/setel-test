import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { MSG } from "../../../config/constants";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    username = username.toLowerCase();
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException(LocalStrategy.name, MSG.FRONTEND.AUTH_FAILED);
    }
    return user;
  }
}
