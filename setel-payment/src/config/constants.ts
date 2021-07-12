import * as msg from "../config/message.json";

export const MSG = msg;

export enum EPaymentStatus {
    INVALID = "invalid",
    VALID = "valid",
    REFUND = "refund",
}

export enum ERole {
    ADMIN,
    ADMIN_SYSTEM,
    USER,
    GUEST,
    DEVELOPER,
}

export const DEFAULT_CONCURRENCY_VERY_LOW = 4;
export const DEFAULT_CONCURRENCY_LOW = 16;
export const DEFAULT_CONCURRENCY_MEDIUM = 64;
export const DEFAULT_CONCURRENCY_HIGH = 256;

export enum EIsHidden {
    HIDDEN = "hidden",
    SHOW = "show",
}
