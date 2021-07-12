import { ApiProperty } from "@nestjs/swagger";

export class CommonResponseDTO {
    @ApiProperty()
    readonly success: boolean;
    @ApiProperty()
    readonly data?: any;
    @ApiProperty()
    readonly message?: string;
}
