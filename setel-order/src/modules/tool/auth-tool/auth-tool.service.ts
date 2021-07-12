import { Inject, Injectable } from "@nestjs/common";
import { Promise } from "bluebird";
import * as crypto from "crypto";
import { Redis } from "ioredis";
import { DEFAULT_CONCURRENCY_LOW } from "../../../config/constants";
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

    async deleteJWTKey(userID: string, jti: string): Promise<number> {
        return this.redisClient.unlink(this.JWTKey(userID, jti));
    }

    async deleteJWTKeys(userID: string, timestamp: number = Date.now()): Promise<void> {
        const stream = this.redisClient.scanStream({
            match: `JWT\\[${userID}*`,
            count: 100,
        });
        return new Promise((resolve, reject) => {
            stream.on("data", async (resultKeys: any[]) => {
                stream.pause();
                await Promise.map(
                    resultKeys,
                    async (key) => {
                        const oldTimestamp = await this.redisClient.get(key);
                        if (Number(oldTimestamp) < timestamp) {
                            await this.redisClient.unlink(key);
                        }
                    },
                    { concurrency: DEFAULT_CONCURRENCY_LOW },
                ).catch((err) => {
                    reject(err);
                });
                stream.resume();
            });
            stream.on("end", () => {
                resolve();
            });
        });
    }
    validateUsernameOrEmail(username: string): boolean {
        return (
            /^[A-Za-z0-9._-]{4,64}$/g.test(username) || // username
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/g.test(
                username,
            )
        ); // email
    }
}
