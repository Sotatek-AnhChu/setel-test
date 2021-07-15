import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/common/repository/base.repository";
import { QueryOption } from "src/tools/request.tool";
import { UserDocument, USER_DB } from "./users.entities";

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(USER_DB)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findAll(option: QueryOption, conditions: any = {}): Promise<UserDocument[]> {
    return this.userModel
      .find(conditions)
      .sort(option.sort)
      .select({ password: 0 })
      .skip(option.skip)
      .limit(option.limit)
      .lean();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).select({ password: 0 }).lean();
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async findByUsernameOrEmail(username: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        $or: [{ username }, { email: username }],
      })
      .exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
}
