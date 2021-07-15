import { Inject, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "../redis-tool/redis-tool.provider";

@Injectable()
export class AuthToolService {
    constructor(
        @Inject(REDIS_CLIENT)
        private readonly redisClient: Redis,
    ) {}
    randomToken(length = 10): string {
        const byte = Math.ceil(length / 2);
        const res = crypto.randomBytes(byte).toString("hex");
        // tslint:disable-next-line:no-bitwise
        return length & 1 ? res.slice(0, -1) : res;
    }
    private JWTKey(userID: string, jti: string): string {
        return `JWT[${userID}][${jti}]`;
    }

    async setJWTKey(userID: string, jti: string, exp: number, timestamp: number = Date.now()): Promise<void> {
        this.redisClient.set(this.JWTKey(userID, jti), timestamp, "EX", exp);
    }

    async checkJWTKey(userID: string, jti: string): Promise<boolean> {
        return this.redisClient.get(this.JWTKey(userID, jti)).then((value) => {
            return value ? true : false;
        });
    }
}
