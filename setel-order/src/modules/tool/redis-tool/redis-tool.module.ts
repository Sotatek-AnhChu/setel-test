import { Module, Global } from "@nestjs/common";
import { RedisToolProvider } from "./redis-tool.provider";

@Global()
@Module({
  providers: [RedisToolProvider],
  exports: [RedisToolProvider],
})
export class RedisToolModule {}
