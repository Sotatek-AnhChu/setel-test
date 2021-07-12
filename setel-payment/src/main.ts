import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as path from "path";
import { AppModule } from "./app.module";
import { MSG } from "./config/constants";
import { RedisIoAdapter } from "./config/redis-adapter";
import { PRODUCTION, PROJECT_NAME, PROJECT_VERSION, SERVER_PORT, SWAGGER_PATH } from "./config/secrets";
import { MongoTool } from "./tools/mongo.tool";
import { RateLimitTool } from "./tools/rate-limit";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // Redis Adapter
    app.useWebSocketAdapter(new RedisIoAdapter(app));
    // Security
    app.set("trust proxy", 1);
    app.disable("x-powered-by");
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    );
    app.use(RateLimitTool.API_LIMITER);

    // Class-validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            skipUndefinedProperties: true,
            exceptionFactory: (errs) => {
                return new BadRequestException(errs, MSG.RESPONSE.BAD_REQUEST);
            },
        }),
    );

    // useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // M-V-C
    app.setBaseViewsDir(path.join(__dirname, "../views"));
    app.useStaticAssets(path.join(__dirname, "public"), {
        maxAge: 31557600000,
    });
    app.setViewEngine("pug");

    // TO-DO
    // fs.writeFileSync("./api-doc/swagger.yaml", JsYaml.safeDump(document));

    // Swagger
    if (!PRODUCTION) {
        const options = new DocumentBuilder().addBearerAuth().setTitle(PROJECT_NAME).setVersion(PROJECT_VERSION).build();
        const document = SwaggerModule.createDocument(app, options);
        SwaggerModule.setup(SWAGGER_PATH, app, document, {
            customSiteTitle: PROJECT_NAME,
            swaggerOptions: {
                defaultModelsExpandDepth: -1,
                displayRequestDuration: true,
                docExpansion: "none",
                filter: true,
                operationsSorter: (a: any, b: any) => {
                    const order: { [field: string]: string } = {
                        get: "0",
                        post: "1",
                        put: "2",
                        delete: "3",
                    };
                    return (
                        order[a._root.entries[1][1]].localeCompare(order[b._root.entries[1][1]]) ||
                        a._root.entries[0][1].localeCompare(b._root.entries[0][1])
                    );
                },
            },
        });
    }

    // Logger
    app.use(morgan(PRODUCTION ? "combined" : "dev"));

    // Static Mongo
    MongoTool.initialize();

    app.use(express.static(path.join(__dirname, "../uploads")));
    app.use(bodyParser.json({ limit: "10mb" }));
    app.enableCors();
    await app.listen(SERVER_PORT);
    console.log("Server start on: " + SERVER_PORT);
}
bootstrap();
