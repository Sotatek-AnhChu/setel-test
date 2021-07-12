import { OmitType, PartialType } from "@nestjs/swagger";
import { User } from "../users.entities";

export class CreateUserDTO extends PartialType(OmitType(User, ["role"])) {}
