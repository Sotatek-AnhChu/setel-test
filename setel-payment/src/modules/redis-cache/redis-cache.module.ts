import { CacheModule, Global, Module } from "@nestjs/common";
import * as redisStore from "cache-manager-redis-store";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../../config/secrets";

@Global()
@Module({
    imports: [
        CacheModule.register({
            store: redisStore,
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
            max: 1024,
        }),
    ],
    exports: [CacheModule],
})
export class RedisCacheModule {}
