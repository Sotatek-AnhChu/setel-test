import { Length, MaxLength } from "class-validator";

export const IsUsername = () => Length(4, 64);
export const IsPassword = () => Length(4, 64);
export const IsFullName = () => MaxLength(64);
export const IsAddress = () => MaxLength(256);
export const IsPhoneNumber = () => Length(9, 20);
