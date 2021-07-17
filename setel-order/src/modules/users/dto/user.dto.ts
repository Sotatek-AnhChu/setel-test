import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString, Length } from "class-validator";
import { IsFullName, IsPassword, IsUsername } from "src/common/decorators/constants.decorator";
import { EGender } from "src/config/constants";
import { USER_CONST } from "../constants/users.constant";

export class UserDTO {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsFullName()
  fullName: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  gender: EGender;

  @Length(USER_CONST.USERNAME_MIN_LENGTH, USER_CONST.USERNAME_MAX_LENGTH)
  @ApiProperty()
  @IsUsername()
  username: string;

  @Length(USER_CONST.PASSWORD_MIN_LENGTH, USER_CONST.PASSWORD_MAX_LENGTH)
  @ApiProperty()
  @IsPassword()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsPhoneNumber()
  phoneNumber: string;
}
