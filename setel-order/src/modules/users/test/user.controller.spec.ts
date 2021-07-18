import { HttpStatus } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { createdUser } from "src/test/helper/user/user.helper";
import { RegisterUserDTO } from "../dto/register-user.dto";
import { UsersController } from "../users.controller";
import { UserDocument, UserSchema, USER_DB } from "../entity/users.entities";
import { UserRepository } from "../users.repository";
import { UsersService } from "../users.service";

describe("UserController", () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let connection: Connection;
  let moduleRef: TestingModule;

  beforeAll(async (done) => {
    moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), MongooseModule.forFeature([{ name: USER_DB, schema: UserSchema }])],
      controllers: [UsersController],
      providers: [UsersService, UserRepository],
      exports: [UsersService],
    }).compile();
    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
    connection = await moduleRef.get(getConnectionToken());
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    await closeInMongodConnection();
    done();
  });

  afterEach(async () => {
    await clearMongodb(connection);
  });

  it("User controller be define", () => {
    expect(usersController).toBeDefined();
  });
  describe("Get my profile", () => {
    it("Get ok", async () => {
      const mockFindById = jest.spyOn(usersService, "findById").mockImplementation(async () => {
        return Promise.resolve(createdUser as UserDocument);
      });
      const testUuid = "60efb4666048dc7a39db65ce";
      const result = await usersController.getMyProfile(testUuid);
      expect(mockFindById).toBeCalledWith(testUuid);
      expect(result.data).toEqual(createdUser);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });
  });
  describe("Register", () => {
    it("Create ok", async () => {
      const createUserDto: RegisterUserDTO = createdUser as RegisterUserDTO;
      const mockCreateUser = jest.spyOn(usersService, "createUser").mockImplementation(() => {
        return Promise.resolve(createdUser as UserDocument);
      });
      const result = await usersController.create(createUserDto);
      expect(mockCreateUser).toBeCalledWith(createUserDto);
      expect(result.data).toEqual(createdUser);
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
    });
  });
});
