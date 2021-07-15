import { forwardRef, UnauthorizedException } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { getConnectionToken } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { MSG } from "src/config/constants";
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

describe("Auth service", () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let connection: Connection;
  let usersService: UsersService;

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
    expect(authService).toBeDefined();
  });

  describe("ValidateUser", () => {
    it("Validate ok", async () => {
      await usersService.createUser(authUser);
      const user = await authService.validateUser(authUser.username, authUser.password);
      expect(user).toBeDefined();
      expect(user.username).toEqual(authUser.username);
    });
    it("Wrong passwrod", async () => {
      await usersService.createUser(authUser);
      await expect(authService.validateUser(authUser.username, authUser.password + "123")).rejects.toThrow(
        new UnauthorizedException(401, MSG.FRONTEND.AUTH_FAILED_WRONG_PASSWORD),
      );
    });
    it("Not found username", async () => {
      await expect(authService.validateUser(authUser.username, authUser.password)).rejects.toThrow(
        new UnauthorizedException(401, MSG.FRONTEND.AUTH_FAILED_USERNAME_NOT_EXIST),
      );
    });
  });
  describe("login", () => {
    it("Login ok", async () => {
      const user = await usersService.createUser(authUser);
      const result = await authService.login(user);
      expect(redisClientProvider.set).toBeCalled();
      expect(result.user).toEqual(user);
      expect(result.refreshToken).toBeDefined();
    });
  });
  describe("Sign access token", () => {
    it("Sign access token ok", async () => {
      redisClientProvider.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
      });
      const user = await usersService.createUser(authUser);
      const token = await authService.login(user);
      const refreshToken = token.refreshToken;
      const result = await authService.signAccessToken(refreshToken);
      expect(redisClientProvider.get).toBeCalled();
      expect(user).toMatchObject(result.user);
      expect(result.accessToken).toBeDefined();
    });
    it("Invalid token", async () => {
      const refreshToken = "123123123";
      await expect(authService.signAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException(AuthService.name, "Invalid token"),
      );
    });
    it("Token expire", async () => {
      redisClientProvider.get = jest.fn().mockImplementation(() => {
        return Promise.resolve(false);
      });
      const user = await usersService.createUser(authUser);
      const token = await authService.login(user);
      const refreshToken = token.refreshToken;
      await expect(authService.signAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException(AuthService.name, "Token expried"),
      );
      expect(redisClientProvider.get).toBeCalled();
    });
  });
});
