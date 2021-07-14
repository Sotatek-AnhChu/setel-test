import {
    ConflictException,
    ForbiddenException,
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { MongoError } from "mongodb";
import { CommonResponseDTO } from "../../common/dto/common-response.dto";
import { DeleteResultDTO } from "../../common/dto/delete-result.dto";
import { ERole, MSG } from "../../config/constants";
import { AV_BACKGROUND_1, AV_BACKGROUND_2, AV_TEXT_1, AV_TEXT_2 } from "../../config/secrets";
import { QueryOption } from "../../tools/request.tool";
import { EUploadFolder, UploadTool } from "../../tools/upload.tool";
import { AuthService } from "../auth/auth.service";
import { AuthToolService } from "../tool/auth-tool/auth-tool.service";
import { User, UserDocument } from "./users.entities";
import { UserRepository } from "./users.repository";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eol = require("os").EOL;

@Injectable()
export class UsersService {
    constructor(
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        private readonly authTool: AuthToolService,
        private readonly userRepository: UserRepository,
    ) {
        eol;
    }

    async getProfile(id: string): Promise<UserDocument> {
        return this.userRepository.getProfile(id);
    }

    async findAll(option: QueryOption, conditions: any = {}): Promise<UserDocument[]> {
        return this.userRepository.findAll(option, conditions);
    }

    async count(conditions: any): Promise<number> {
        return this.userRepository.count(conditions);
    }

    async findById(id: string): Promise<UserDocument> {
        return this.userRepository.findById(id);
    }

    async findByUsernameOrEmail(username: string): Promise<UserDocument> {
        return this.userRepository.findByUsernameOrEmail(username);
    }

    async createUser(user: User, avatar: Express.Multer.File): Promise<UserDocument> {
        if (!this.authTool.validateUsernameOrEmail(user.username)) {
            throw new ConflictException(400, MSG.FRONTEND.USERNAME_INVALID);
        }
        user.avatar =
            user.role === ERole.USER
                ? encodeURI(
                      `https://ui-avatars.com/api/?rounded=true&bold=true&size=128&name=${user.fullName}&background=${AV_BACKGROUND_1}&color=${AV_TEXT_1}`,
                  )
                : encodeURI(
                      `https://ui-avatars.com/api/?rounded=true&bold=true&size=128&name=${user.fullName}&background=${AV_BACKGROUND_2}&color=${AV_TEXT_2}`,
                  );
        if (avatar) {
            user.avatar = UploadTool.getURL(EUploadFolder.IMAGE, avatar.filename);
        }
        user.role = ERole.USER;
        return this.userRepository
            .create(user)
            .then((result) => {
                return result;
            })
            .catch((err) => {
                if ((err as MongoError).code === 11000) {
                    const field = Object.keys((err as any).keyPattern)[0];
                    throw new ConflictException(409, `${field} had been used!`);
                }
                throw err;
            });
    }

    async register(user: User, avatar: Express.Multer.File): Promise<CommonResponseDTO> {
        user.username = user.username.toLowerCase();
        user.email = user.email.toLowerCase();
        if (!this.authTool.validateUsernameOrEmail(user.username)) {
            throw new UnauthorizedException(400, MSG.FRONTEND.USERNAME_INVALID);
        }
        const hasUser = await this.userRepository
            .getMany({
                conditions: {
                    username: user.username,
                },
            })
            .exec()
            .then((result) => (result ? 1 : 0));
        if (hasUser > 0) {
            throw new ConflictException(409, MSG.FRONTEND.USERNAME_DUPLICATED);
        }
        const hasEmail = await this.userRepository
            .getOne({
                conditions: {
                    email: user.email,
                },
            })
            .exec()
            .then((result) => (result ? 1 : 0));
        if (hasEmail > 0) {
            throw new ConflictException(409, MSG.FRONTEND.EMAIL_DUPLICATED);
        }

        try {
            user.avatar = encodeURI(
                `https://ui-avatars.com/api/?rounded=true&bold=true&size=128&name=${user.fullName}&background=${AV_BACKGROUND_1}&color=${AV_TEXT_1}`,
            );
            if (avatar) {
                user.avatar = UploadTool.getURL(EUploadFolder.IMAGE, avatar.filename);
            }
            user.role = ERole.USER;

            // New service
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() + 3);
            user.expiredAt = expiredDate;
            return { success: true };
        } catch (err) {
            if (err.code === 11000) {
                const field = Object.keys((err as any).keyPattern)[0];
                throw new ConflictException(HttpStatus.CONFLICT, `${field} has been used !`);
            } else {
                throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, err.message);
            }
        }
    }
}
