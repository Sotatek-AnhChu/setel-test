import { PartialType } from "@nestjs/swagger";
import { UserDTO } from "./user.dto";

export class GetUserDTO extends PartialType(UserDTO) {}
