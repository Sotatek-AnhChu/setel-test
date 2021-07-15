import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request } from "express";
import * as path from "path";
import { MSG } from "../../config/constants";
import { PRODUCTION } from "../../config/secrets";

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
        let statusCode: any = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = MSG.RESPONSE.INTERNAL_SERVER_ERROR;
        if (exception instanceof HttpException) {
            [statusCode, message] = this.handleHttpException(exception);
        }
        if (String(exception.name) === "MongoError" && exception.code === 11000) {
            [statusCode, message] = this.handleConflict(exception);
        }
        if (String(exception.name) === "ValidationError") {
            [statusCode, message] = this.handleValidatorError(exception);
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

    handleHttpException(exception: any) {
        const statusCode = Number(exception.getStatus());
        const message = exception.response.message;
        return [statusCode, message];
    }

    handleValidatorError(exception: any) {
        const statusCode = HttpStatus.BAD_REQUEST;
        const message = exception.message;
        return [statusCode, message];
    }

    handleConflict(exception: any) {
        const statusCode = HttpStatus.CONFLICT;
        const message = `Duplicate : ${Object.values(exception.keyValue).join(", ")}`;
        return [statusCode, message];
    }
}
