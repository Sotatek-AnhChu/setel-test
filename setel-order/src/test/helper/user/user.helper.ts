import { EGender, ERole } from "src/config/constants";
import { User } from "src/modules/users/entity/users.entities";

export const createdUser: User = {
  firstName: "Test",
  lastName: "Test",
  fullName: "Test Test",
  username: "ducanh2",
  password: "qwerty",
  email: "sdfsdfsdfsdf@gmail.com",
  phoneNumber: "0936609206",
  role: ERole.USER,
  birthday: new Date("2021-07-14T01:59:24.200Z"),
  gender: EGender.MALE,
} as User;

export const createdUser2: User = {
  firstName: "Test2",
  lastName: "Test2",
  fullName: "Test2 Test2",
  username: "ducanh3",
  password: "qwerty",
  email: "dfsdfsdf@gmail.com",
  phoneNumber: "0936609209",
  role: ERole.USER,
  birthday: new Date("2021-07-14T01:59:24.200Z"),
  gender: EGender.MALE,
} as User;
