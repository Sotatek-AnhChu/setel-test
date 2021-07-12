import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDTO {
    @ApiProperty()
    readonly message: string;
}
