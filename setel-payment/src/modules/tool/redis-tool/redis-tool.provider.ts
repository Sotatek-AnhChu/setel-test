import { Provider } from "@nestjs/common";
import * as Redis from "ioredis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../../../config/secrets";

export const REDIS_CLIENT = "REDIS_CLIENT";
export const RedisToolProvider: Provider = {
    provide: REDIS_CLIENT,
    useFactory: (): Redis.Redis => {
        return new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
        });
    },
};
