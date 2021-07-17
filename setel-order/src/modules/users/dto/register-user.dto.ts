import { PartialType, PickType } from "@nestjs/swagger";
import { UserDTO } from "./user.dto";

export class RegisterUserDTO extends PartialType(
  PickType(UserDTO, ["firstName", "lastName", "fullName", "username", "password", "email", "phoneNumber"]),
) {}
