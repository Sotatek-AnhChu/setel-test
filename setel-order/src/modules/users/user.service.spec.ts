import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { clearMongodb, closeInMongodConnection, rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { createdUser, createdUser2 } from "src/test/helper/user/user.helper";
import { QueryOption } from "../../tools/request.tool";
import { UsersController } from "./users.controller";
import { User, UserSchema, USER_DB } from "./users.entities";
import { UserRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UserService", () => {
    let usersService: UsersService;
    let moduleRef: TestingModule;
    let connection: Connection;

    beforeAll(async (done) => {
        moduleRef = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), MongooseModule.forFeature([{ name: USER_DB, schema: UserSchema }])],
            controllers: [UsersController],
            providers: [UsersService, UserRepository],
            exports: [UsersService],
        }).compile();
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

    it("UserService be define", () => {
        expect(usersService).toBeDefined();
    });

    describe("find by id", () => {
        it("Get ok ", async () => {
            const userTest = { ...createdUser };
            const user = await usersService.createUser(userTest);
            const result = await usersService.findById(user._id);
            delete userTest.password;
            expect(result).toMatchObject(userTest);
        });
    });
    describe("find all", () => {
        it("Get all", async () => {
            await usersService.createUser(createdUser);
            await usersService.createUser(createdUser2);
            const options: QueryOption = {
                select: { username: 1 },
                skip: 0,
                limit: 10,
            };
            const conditions: any = {};
            const result: User[] = await usersService.findAll(options, conditions);
            expect(result.length).toEqual(2);
        });
    });
    describe("Count", () => {
        it("Count all", async () => {
            await usersService.createUser(createdUser);
            await usersService.createUser(createdUser2);
            const result = await usersService.count({});
            expect(result).toEqual(2);
        });
        it("Count with condition", async () => {
            await usersService.createUser(createdUser);
            await usersService.createUser(createdUser2);
            const result = await usersService.count({
                username: createdUser2.username,
            });
            expect(result).toEqual(result);
        });
    });
    describe("Get by username or email", () => {
        it("get by username", async () => {
            const userTest = { ...createdUser };
            await usersService.createUser(userTest);
            delete userTest.updatedAt;
            delete userTest.password;
            const result = await usersService.findByUsernameOrEmail(userTest.username);
            expect(result).toMatchObject(userTest);
        });
        it("Get by username", async () => {
            const userTest = { ...createdUser };
            await usersService.createUser(userTest);
            delete userTest.updatedAt;
            delete userTest.password;
            const result = await usersService.findByUsernameOrEmail(userTest.email);
            expect(result).toMatchObject(userTest);
        });
    });
    describe("Create user", () => {
        it("Create user ok", async () => {
            const userTest = { ...createdUser };
            const user = await usersService.createUser(userTest);
            const result = await usersService.findById(user._id);
            delete userTest.password;
            expect(result).toMatchObject(userTest);
        });
        it("Throws error", async () => {
            const userTest = { ...createdUser };
            await usersService.createUser(userTest);
            await expect(usersService.createUser(userTest)).rejects.toBeDefined();
        });
    });
});
