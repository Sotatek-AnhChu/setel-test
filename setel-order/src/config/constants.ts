import * as msg from "../config/message.json";

export const MSG = msg;

export enum EOrderStatus {
    CREATED = "CREATED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    DELIVERED = "DELIVERED",
}

export enum ESettingValueType {
    STRING = "string",
    BOOLEAN = "boolean",
    NUMBER = "number",
}

export enum EIsLooked {
    NO,
    YES,
}
export enum ENotificationType {
    LEVEL1,
    LEVEL2,
    LEVEL3,
}

export enum ETypeAppVersion {
    IOS = "IOS",
    ANDROID = "ANDROID",
}

export enum ERole {
    ADMIN,
    ADMIN_SYSTEM,
    USER,
    GUEST,
    DEVELOPER,
}

export enum EGioiTinh {
    NAM,
    NU,
}

export enum ENotificationStatus {
    UNREAD,
    READ,
}

export const DEFAULT_CONCURRENCY_VERY_LOW = 4;
export const DEFAULT_CONCURRENCY_LOW = 16;
export const DEFAULT_CONCURRENCY_MEDIUM = 64;
export const DEFAULT_CONCURRENCY_HIGH = 256;

export enum EIsHidden {
    HIDDEN = "hidden",
    SHOW = "show",
}
