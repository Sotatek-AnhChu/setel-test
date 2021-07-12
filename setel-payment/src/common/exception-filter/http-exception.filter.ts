import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request } from "express";
import { MSG } from "../../config/constants";
import { PRODUCTION } from "../../config/secrets";
import * as path from "path";
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly PROJECT_DIR = path.join(__dirname, "../../../");
    private readonly logger = new Logger(HttpExceptionFilter.name);
    private convertStack(stack: string): string[] {
        return stack.split("\n").map((row) => row.replace(this.PROJECT_DIR, "").trim());
    }

    async catch(exception: any, host: ArgumentsHost) {
        this.logger.error(exception.stack);
        this.logger.error(JSON.stringify(exception, null, 2));
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse();
        let statusCode: number;
        let mongoConflict = false;
        this.logger.error(exception);
        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
        } else if (exception.name === "MongoError" && exception.code === 11000) {
            statusCode = 409;
            mongoConflict = true;
        } else {
            statusCode = 500;
        }
        let message = "";
        if (!mongoConflict) {
            message = (statusCode !== 500 && exception.message) || MSG.RESPONSE.INTERNAL_SERVER_ERROR;
        } else {
            message = `Duplicate : ${Object.values(exception.keyValue).join(", ")}`;
        }

        const time = new Date().toLocaleString();
        const routePath = `${request.method} ${request.originalUrl}`;
        const errorObject = {
            error: {
                time,
                message,
                path: routePath,
                detail: PRODUCTION
                    ? undefined
                    : {
                          stack: this.convertStack(exception.stack),
                      },
            },
            exception,
            statusCode,
        };
        response.status(statusCode).json(errorObject);
    }
}
