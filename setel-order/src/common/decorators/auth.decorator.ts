import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ERole } from "../../config/constants";
import { RolesGuard } from "../guards/roles.guard";

export const Roles = (...roles: ERole[]) => SetMetadata("roles", roles);

export const Authorization = () => applyDecorators(UseGuards(AuthGuard("jwt"), RolesGuard), ApiBearerAuth());
