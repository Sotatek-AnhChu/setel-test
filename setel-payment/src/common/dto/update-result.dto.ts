import { ApiProperty } from "@nestjs/swagger";

export class UpdateResultDTO {
  @ApiProperty()
  readonly ok?: number;
  @ApiProperty()
  readonly n?: number;
  @ApiProperty()
  readonly nModified?: number;
}
