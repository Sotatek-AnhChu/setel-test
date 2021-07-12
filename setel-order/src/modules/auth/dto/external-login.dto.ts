import { ApiProperty } from "@nestjs/swagger";

export class ExternalLoginDTO {
    @ApiProperty()
    // tslint:disable-next-line:variable-name
    access_token: string;
}
