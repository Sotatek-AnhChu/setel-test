import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/modules/users/users.entities";

export class AccessTokenResponse {
  @ApiProperty()
  user: User;
  @ApiProperty()
  accessToken: string;
}
