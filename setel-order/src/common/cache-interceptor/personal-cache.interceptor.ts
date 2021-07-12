import { Injectable, CacheInterceptor, ExecutionContext, Logger } from "@nestjs/common";
import { Request } from "express";
import { CACHE_KEY_METADATA } from "@nestjs/common/cache/cache.constants";
import { User } from "../../modules/users/users.entities";

@Injectable()
export class PersonalCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(PersonalCacheInterceptor.name);

    trackBy(context: ExecutionContext): string | undefined {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
        const cacheKeyMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
        this.logger.log(cacheKeyMetadata);
        if (!isHttpApp || cacheKeyMetadata) {
            return cacheKeyMetadata;
        }
        const request = context.getArgByIndex(0);
        if (httpAdapter.getRequestMethod(request) !== "GET") {
            return undefined;
        }
        const url = context.switchToHttp().getRequest<Request>().originalUrl;
        const user = context.switchToHttp().getRequest<Request>()?.user as User | null;
        return `${url}:${user?.username}`;
    }
}
