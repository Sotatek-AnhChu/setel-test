import { PartialType, PickType } from "@nestjs/swagger";
import { User } from "../users.entities";

export class RegisterUserDTO extends PartialType(
  PickType(User, ["firstName", "lastName", "fullName", "username", "password", "email", "phoneNumber"]),
) {}
