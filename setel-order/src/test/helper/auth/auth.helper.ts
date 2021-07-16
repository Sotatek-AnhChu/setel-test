import { EGender, ERole } from "src/config/constants";
import { User } from "src/modules/users/users.entities";

export const authUser: User = {
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
