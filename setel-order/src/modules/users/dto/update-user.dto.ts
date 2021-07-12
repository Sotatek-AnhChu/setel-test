import { PartialType, PickType } from "@nestjs/swagger";
import { User } from "../users.entities";

export class UpdateUserDTO extends PartialType(PickType(User, [])) {}
