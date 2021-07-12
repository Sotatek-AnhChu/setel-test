import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class SocketGuard implements CanActivate {
    private readonly logger = new Logger("SocketGuard");
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        this.logger.verbose(request.handshake.query);
        return false;
        // return validateRequest(request);
    }
}
