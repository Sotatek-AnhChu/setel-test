import { ERole } from "../../config/constants";
import { ApiProperty } from "@nestjs/swagger";

export class TrackUserDTO {
    @ApiProperty()
    username: string;
    @ApiProperty()
    name: string;
    @ApiProperty({
        enum: Object.values(ERole),
    })
    role: ERole;
    @ApiProperty()
    email: string;
    @ApiProperty()
    phoneNumber: string;
    @ApiProperty()
    address: string;
}
