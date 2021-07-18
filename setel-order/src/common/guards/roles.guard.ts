import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ERole } from "../../config/constants";
import { PRODUCTION } from "../../config/secrets";
import { User } from "../../modules/users/entity/users.entities";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles =
      this.reflector.get<ERole[]>("roles", context.getHandler()) ||
      this.reflector.get<ERole[]>("roles", context.getClass()) ||
      [];
    const user = context.switchToHttp().getRequest().user as User;
    if (!PRODUCTION && user?.role === ERole.DEVELOPER) {
      return true;
    }
    return roles.length === 0 ? true : user && roles.includes(user.role);
  }
}
