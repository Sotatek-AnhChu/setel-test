import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "socket.io-redis";
import { RedisClient } from "redis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./secrets";

const pubClient = new RedisClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  auth_pass: REDIS_PASSWORD,
});

const subClient = pubClient.duplicate();

const redisAdapter = createAdapter({ pubClient, subClient });

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
