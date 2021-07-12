import { PartialType, PickType } from "@nestjs/swagger";
import { User } from "../users.entities";

export class UpdateMyUserDTO extends PartialType(PickType(User, ["phoneNumber", "avatar", "birthday"])) {}
