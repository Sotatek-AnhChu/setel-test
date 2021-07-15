import { BadRequestException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ObjectIdPipeTransform implements PipeTransform {
  constructor() {
    // super();
  }
  async transform(value: any) {
    if (value === null || value === undefined) {
      throw new BadRequestException(HttpStatus.BAD_REQUEST, "Id is null");
    }
    if (Types.ObjectId.isValid(value)) {
      return value;
    }
    throw new BadRequestException(HttpStatus.BAD_REQUEST, "Id is not objectid");
  }
}
