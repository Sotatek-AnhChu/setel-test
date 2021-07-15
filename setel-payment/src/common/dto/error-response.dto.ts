import { ApiProperty } from "@nestjs/swagger";

export class ErrorMessageDTO {
  @ApiProperty({ description: "Nội dung lỗi" })
  readonly message: string;
  @ApiProperty({ description: "Chi tiết lỗi" })
  readonly detail: any;
}

export class ErrorResponseDTO {
  @ApiProperty({ description: "Thông tin lỗi" })
  error: ErrorMessageDTO;
  @ApiProperty({ description: "Mã lỗi HTTP" })
  statusCode: number;
}
