import { ApiProperty } from "@nestjs/swagger";
import { Allow } from "class-validator";

export class RefreshTokenDTO {
  @ApiProperty()
  @Allow()
  refreshToken: string;
}
