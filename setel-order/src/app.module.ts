import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpExceptionFilter } from "./common/exception-filter/http-exception.filter";
import { DATABASE_URI } from "./config/secrets";
import { OrderModule } from "./modules/order/order.module";
import { AuthToolModule } from "./modules/tool/auth-tool/auth-tool.module";
import { RedisToolModule } from "./modules/tool/redis-tool/redis-tool.module";
import { UsersModule } from "./modules/users/users.module";
import { WebhookModule } from "./modules/webhook/webhook.module";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require("cache-manager-redis-store");

@Module({
    imports: [
        MongooseModule.forRoot(DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            retryDelay: 5000,
        }),
        UsersModule,
        AuthToolModule,
        RedisToolModule,
        OrderModule,
        WebhookModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {
    constructor() {
        redisStore;
    }
}
