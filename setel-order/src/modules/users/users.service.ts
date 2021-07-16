import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { ERole, MSG } from "../../config/constants";
import { QueryOption } from "../../tools/request.tool";
import { User, UserDocument } from "./users.entities";
import { UserRepository } from "./users.repository";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eol = require("os").EOL;

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {
    eol;
  }
  async validateUsernameOrEmail(username: string): Promise<boolean> {
    return (
      /^[A-Za-z0-9._-]{4,64}$/g.test(username) || // username
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/g.test(
        username,
      )
    ); // email
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

  async createUser(user: User): Promise<UserDocument> {
    if (!(await this.validateUsernameOrEmail(user.username))) {
      throw new ConflictException(400, MSG.FRONTEND.USERNAME_INVALID);
    }
    user.role = ERole.USER;
    return this.userRepository
      .create(user)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        if (err.code === 11000) {
          const field = Object.keys(err.keyValue).join(".");
          throw new ConflictException(409, `${field} had been used!`);
        }
        throw err;
      });
  }
}
