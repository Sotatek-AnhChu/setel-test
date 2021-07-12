import { PartialType } from "@nestjs/swagger";
import { User } from "../users.entities";

export class GetUserDTO extends PartialType(User) {}
