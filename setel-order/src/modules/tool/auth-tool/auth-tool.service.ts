import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "../redis-tool/redis-tool.provider";

@Injectable()
export class AuthToolService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}
  public static JWTKey(userID: string, jti: string): string {
    return `JWT[${userID}][${jti}]`;
  }

  async setJWTKey(userID: string, jti: string, exp: number, timestamp: number = Date.now()): Promise<void> {
    this.redisClient.set(AuthToolService.JWTKey(userID, jti), timestamp, "EX", exp);
  }

  async checkJWTKey(userID: string, jti: string): Promise<boolean> {
    return this.redisClient.get(AuthToolService.JWTKey(userID, jti)).then((value) => {
      return value ? true : false;
    });
  }
}
