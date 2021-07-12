import { Test, TestingModule } from "@nestjs/testing";
import { Authentication } from "./auth.controller";

describe("Auth Controller", () => {
    let controller: Authentication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [Authentication],
        }).compile();

        controller = module.get<Authentication>(Authentication);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
