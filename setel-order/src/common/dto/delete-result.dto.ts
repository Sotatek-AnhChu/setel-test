import { ApiProperty } from "@nestjs/swagger";

export class DeleteResultDTO {
  @ApiProperty()
  readonly ok?: number;
  @ApiProperty()
  readonly n?: number;
  @ApiProperty()
  readonly deletedCount?: number;
}
