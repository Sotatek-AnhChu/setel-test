import { ApikeyMiddleware } from "./apikey.middleware";

describe("ApikeyMiddleware", () => {
    it("should be defined", () => {
        expect(new ApikeyMiddleware()).toBeDefined();
    });
});
