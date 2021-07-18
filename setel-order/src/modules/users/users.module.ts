import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { UserSchema, USER_DB } from "./entity/users.entities";
import { UserRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: USER_DB, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
