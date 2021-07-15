import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { APIKEY } from "src/config/secrets";

@Injectable()
export class ApikeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    if (req.headers["api-key"] !== APIKEY) {
      throw new UnauthorizedException(ApikeyMiddleware.name, "invalid api-key");
    }
    next();
  }
}
