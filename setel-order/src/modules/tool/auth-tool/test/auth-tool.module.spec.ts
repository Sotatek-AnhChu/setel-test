import { Test } from "@nestjs/testing";
import { REDIS_CLIENT } from "../../redis-tool/redis-tool.provider";
import { AuthToolService } from "../auth-tool.service";

describe("AuthToolModule", () => {
  let authToolService: AuthToolService;

  const redisClientProvider = {
    get: jest.fn().mockImplementation(() => {
      // will be setup in future
    }),
    set: jest.fn().mockImplementation(() => {
      // will be setup in future
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthToolService,
        {
          provide: REDIS_CLIENT,
          useValue: redisClientProvider,
        },
      ],
    }).compile();
    authToolService = moduleRef.get<AuthToolService>(AuthToolService);
  });

  it("To Be define", () => {
    expect(authToolService).toBeDefined();
  });
  describe("set jwt key", () => {
    it("Set jwt ok", async () => {
      const userID = "test user id";
      const jti = "Test jti";
      const exp = 1000;
      const timestamp = Date.now();
      const jwtKey = AuthToolService.JWTKey(userID, jti);
      await authToolService.setJWTKey(userID, jti, exp, timestamp);
      expect(redisClientProvider.set).toBeCalledWith(jwtKey, timestamp, "EX", exp);
    });
  });
  describe("check jwt key", () => {
    it("check ok", async () => {
      const userID = "test user id";
      const jti = "Test jti";
      const jwtKey = AuthToolService.JWTKey(userID, jti);
      redisClientProvider.get = jest.fn().mockImplementation(async () => {
        return Promise.resolve(true);
      });
      await expect(authToolService.checkJWTKey(userID, jti)).resolves.toEqual(true);
      expect(redisClientProvider.get).toBeCalledWith(jwtKey);
    });
    it("Check fail", async () => {
      const userID = "test user id";
      const jti = "Test jti";
      const jwtKey = AuthToolService.JWTKey(userID, jti);
      redisClientProvider.get = jest.fn().mockImplementation(async () => {
        return Promise.resolve(false);
      });
      await expect(authToolService.checkJWTKey(userID, jti)).resolves.toEqual(false);
      expect(redisClientProvider.get).toBeCalledWith(jwtKey);
    });
  });
});
