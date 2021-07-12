import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as bcrypt from "bcryptjs";
import { IsEmail, IsString, Length } from "class-validator";
import * as mongoose from "mongoose";
import { IsFullName, IsPassword, IsPhoneNumber, IsUsername } from "../../common/decorators/constants.decorator";
import { EGioiTinh, ERole } from "../../config/constants";
import { StringTool } from "../../tools/string.tool";
import { USER_CONST } from "./constants/users.constant";

export const USER_DB = "Users";

@Schema({
    timestamps: true,
    collection: USER_DB,
    toJSON: { virtuals: true },
    collation: { locale: "vi" },
})
export class User {
    @ApiProperty()
    @IsString()
    @Prop({
        type: String,
        index: true,
        required: true,
        trim: true,
        maxlength: USER_CONST.NAME_MAX_LENGTH,
    })
    firstName: string;

    @ApiProperty()
    @IsString()
    @Prop({
        type: String,
        index: true,
        required: true,
        trim: true,
        maxlength: USER_CONST.NAME_MAX_LENGTH,
    })
    lastName: string;

    @ApiProperty()
    @IsFullName()
    @Prop({
        type: String,
        index: true,
        required: true,
        trim: true,
        maxlength: USER_CONST.NAME_MAX_LENGTH,
    })
    fullName: string;

    @ApiProperty()
    @Prop({
        type: Date,
    })
    birthday: Date;

    @ApiProperty()
    @Prop({
        enum: Object.values(EGioiTinh),
    })
    sex: EGioiTinh;

    @Length(USER_CONST.USERNAME_MIN_LENGTH, USER_CONST.USERNAME_MAX_LENGTH)
    @ApiProperty()
    @IsUsername()
    @Prop({
        type: String,
        required: true,
        minlength: USER_CONST.USERNAME_MIN_LENGTH,
        maxlength: USER_CONST.USERNAME_MAX_LENGTH,
        lowercase: true,
        trim: true,
    })
    username: string;

    @Length(USER_CONST.PASSWORD_MIN_LENGTH, USER_CONST.PASSWORD_MAX_LENGTH)
    @ApiProperty()
    @IsPassword()
    @Prop({
        type: String,
        required: true,
        minlength: USER_CONST.PASSWORD_MIN_LENGTH,
        maxLength: USER_CONST.PASSWORD_MAX_LENGTH,
    })
    password: string;

    @ApiProperty()
    @IsEmail()
    @Prop({
        type: String,
        lowercase: true,
        trim: true,
        sparse: true,
        maxlength: USER_CONST.EMAIL_MAX_LENGTH,
    })
    email: string;

    @ApiProperty({ required: true })
    @IsPhoneNumber()
    @Prop({
        maxlength: USER_CONST.PHONE_NUMBER_MAX_LENGTH,
    })
    phoneNumber: string;

    @ApiProperty()
    @Prop({
        enum: Object.values(ERole),
    })
    role: ERole;

    @ApiProperty()
    @Prop({})
    contactEmail: string;

    @ApiProperty({ type: "string", format: "binary", required: false })
    @Prop({})
    avatar: string;

    @Prop({})
    jti: string;

    @Prop({})
    updatedAt: Date;

    @Prop({
        type: Date,
    })
    expiredAt: Date;

    @Prop({
        type: Date,
    })
    lastTimeLogin: Date;

    comparePassword: (password: string) => Promise<boolean>;
    compareResetPasswordToken: (password: string) => Promise<boolean>;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre("save", async function save() {
    const nameComponent = StringTool.getNameComponent(this.get("fullName"));
    this.set("fullName", nameComponent.fullname);
    this.set("lastName", nameComponent.lastname);
    this.set("firstName", nameComponent.firstname);
    if (this.isModified("password")) {
        const password = this.get("password");
        this.set("password", password ? await bcrypt.hash(password, 10) : undefined);
    }
    if (this.isModified("resetToken.password")) {
        const token = this.get("resetToken.password");
        this.set("resetToken.password", token ? await bcrypt.hash(token, 10) : token);
    }
});

UserSchema.methods.comparePassword = async function comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, ((this as unknown) as User).password);
};

export interface UserDocument extends User, mongoose.Document {}
