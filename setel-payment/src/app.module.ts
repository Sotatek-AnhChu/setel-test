import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpExceptionFilter } from "./common/exception-filter/http-exception.filter";
import { DATABASE_URI } from "./config/secrets";
import { ApikeyMiddleware } from "./middlewares/apikey.middleware";
import { PaymentModule } from "./modules/payment/payment.module";
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
        WebhookModule,
        PaymentModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApikeyMiddleware).forRoutes("/webhook/");
    }
    constructor() {
        redisStore;
    }
}
