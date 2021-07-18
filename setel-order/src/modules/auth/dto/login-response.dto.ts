import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entity/users.entities";

export class LoginResponseDTO {
  @ApiProperty()
  readonly user: User;
  @ApiProperty()
  readonly refreshToken: string;
}
