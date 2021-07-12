import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JWT_SECRET, REFRESH_TOKEN_EXP } from "../../config/secrets";
import { UsersModule } from "../users/users.module";
import { Authentication } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: {
                expiresIn: REFRESH_TOKEN_EXP,
            },
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy] /*FacebookStrategy, GoogleStrategy],*/,
    controllers: [Authentication],
    exports: [AuthService],
})
export class AuthModule {}
