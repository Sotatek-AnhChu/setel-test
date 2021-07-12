import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";

export class AuthDTO {
    @ApiProperty()
    @Length(4, 64)
    username: string;

    @Length(4, 64)
    @ApiProperty()
    readonly password: string;
}
