import { Document, Query } from "mongoose";
import { QueryOption } from "./request.tool";

export class ObjectTool {
    static filterObject(object: any, restrictFields: string[]): any {
        const restrictLength = restrictFields.length;
        for (let i = 0; i < restrictLength; i++) {
            delete object[restrictFields[i]];
        }
        return object;
    }

    static applyQueryOption<T extends Document>(p: Query<T[], T>, options: QueryOption): Query<T[], T> {
        return p.sort(options.sort).skip(options.skip).limit(options.limit);
    }

    static parse<T>(stringObject: any): T {
        try {
            if (stringObject === "undefined") {
                return undefined;
            }
            return stringObject && JSON.parse(stringObject);
        } catch (err) {
            console.error("ObjectTool parse error:", err.message, stringObject);
            return stringObject as T;
        }
    }

    static isNullOrUndefined(obj: any) {
        return obj === undefined || obj === null;
    }
}
