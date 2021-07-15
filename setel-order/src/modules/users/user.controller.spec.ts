import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { rootMongooseTestModule } from "src/test/helper/mongodb-memory";
import { UsersController } from "./users.controller";
import { UserSchema, USER_DB } from "./users.entities";
import { UserRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UserController", () => {
    let usersController: UsersController;
    let moduleRef: TestingModule;

    beforeAll(async (done) => {
        moduleRef = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), MongooseModule.forFeature([{ name: USER_DB, schema: UserSchema }])],
            controllers: [UsersController],
            providers: [UsersService, UserRepository],
            exports: [UsersService],
        }).compile();
        usersController = moduleRef.get<UsersController>(UsersController);
        done();
    });
    it("User controller be define", () => {
        expect(usersController).toBeDefined();
    });
});
