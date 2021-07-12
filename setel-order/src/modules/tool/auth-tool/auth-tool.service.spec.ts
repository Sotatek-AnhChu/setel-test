import { Test, TestingModule } from "@nestjs/testing";
import { AuthToolService } from "./auth-tool.service";

describe("AuthToolService", () => {
    let service: AuthToolService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthToolService],
        }).compile();

        service = module.get<AuthToolService>(AuthToolService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
