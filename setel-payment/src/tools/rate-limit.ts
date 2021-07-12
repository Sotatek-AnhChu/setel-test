import * as RateLimit from "express-rate-limit";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "../config/secrets";

export class RateLimitTool {
    static API_LIMITER = RateLimit({
        windowMs: RATE_LIMIT_WINDOW_MS, //
        max: RATE_LIMIT_MAX,
    });

    // static API_LIMITER = RateLimit({
    //     windowMs: 15 * 60 * 1000, // 15 minutes
    //     max: 100
    // });
}
