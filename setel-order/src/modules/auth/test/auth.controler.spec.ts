import { forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { getConnectionToken } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { Connection } from "mongoose";
import { authUser } from "src/test/helper/auth/auth.helper";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { JWT_SECRET, REFRESH_TOKEN_EXP } from "../../../config/secrets";
import { AuthToolService } from "../../tool/auth-tool/auth-tool.service";
import { REDIS_CLIENT } from "../../tool/redis-tool/redis-tool.provider";
import { UsersModule } from "../../users/users.module";
import { UsersService } from "../../users/users.service";
import { Authentication } from "../auth.controller";
import { AuthService } from "../auth.service";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { LocalStrategy } from "../strategies/local.strategy";

describe("Authenication", () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let connection: Connection;
  let usersService: UsersService;
  let authToolService: AuthToolService;
  let authenication: Authentication;

  const redisClientProvider = {
    get: jest.fn().mockImplementation(() => {
      // will be setup in future
    }),
    set: jest.fn().mockImplementation(() => {
      // will be setup in future
    }),
  };

  beforeAll(async (done) => {
    moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        forwardRef(() => UsersModule),
        PassportModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: {
            expiresIn: REFRESH_TOKEN_EXP,
          },
        }),
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        AuthToolService,
        {
          provide: REDIS_CLIENT,
          useValue: redisClientProvider,
        },
      ],
      controllers: [Authentication],
      exports: [AuthService],
    }).compile();
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    authToolService = moduleRef.get<AuthToolService>(AuthToolService);
    authenication = moduleRef.get<Authentication>(Authentication);
    connection = await moduleRef.get(getConnectionToken());
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    moduleRef.close();
    await closeInMongodConnection();
    done();
  });

  afterEach(async () => {
    await clearMongodb(connection);
    jest.resetAllMocks();
  });

  it("Be define", () => {
    expect(authenication).toBeDefined();
  });
  describe("Login", () => {
    it("Be return token when login", async () => {
      const user = await usersService.createUser(authUser);

      const req = {
        user,
      };
      const result = await authenication.login((req as unknown) as Request);
      expect(redisClientProvider.set).toBeCalled();
      expect(result.user).toEqual(user);
      expect(result.refreshToken).toBeDefined();
    });
  });
  describe("Get access token", () => {
    it("Be return access token", async () => {
      redisClientProvider.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
      });
      const user = await usersService.createUser(authUser);
      const token = await authService.login(user);
      const refreshToken = token.refreshToken;
      const result = await authenication.getAccessToken({
        refreshToken,
      });
      expect(redisClientProvider.get).toBeCalled();
      expect(user).toMatchObject(result.user);
      expect(result.accessToken).toBeDefined();
    });
  });
});
