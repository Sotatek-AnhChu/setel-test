import { yellow } from "chalk";
import * as dotenv from "dotenv";

dotenv.config();

export const getEnv = (key: string, ignore = false): string => {
  const value = process.env[key];
  return value;
};

// Server
export const ENVIRONMENT = getEnv("NODE_ENV");
export const PRODUCTION = ENVIRONMENT === "production";
export const DEVELOPMENT = ENVIRONMENT === "development";

export const SERVER_ADDRESS = getEnv("SERVER_ADDRESS");
export const SERVER_PORT = getEnv("SERVER_PORT");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const REFRESH_TOKEN_EXP = Number(getEnv("REFRESH_TOKEN_EXP"));
export const ACCESS_TOKEN_EXP = Number(getEnv("ACCESS_TOKEN_EXP"));
export const PROJECT_NAME = getEnv("PROJECT_NAME");
export const PROJECT_VERSION = getEnv("PROJECT_VERSION");

export const RATE_LIMIT_WINDOW_MS = Number(getEnv("RATE_LIMIT_WINDOW_MS") || 1000);
export const RATE_LIMIT_MAX = Number(getEnv("RATE_LIMIT_MAX") || 64);

// UI Avatar
export const AV_BACKGROUND_1 = getEnv("AV_BACKGROUND_1");
export const AV_TEXT_1 = getEnv("AV_TEXT_1");
export const AV_BACKGROUND_2 = getEnv("AV_BACKGROUND_2");
export const AV_TEXT_2 = getEnv("AV_TEXT_2");

// Mongo
const MONGO_USERNAME = getEnv("MONGO_USERNAME");
const MONGO_PASSWORD = encodeURIComponent(getEnv("MONGO_PASSWORD"));
const MONGO_PORT = getEnv("MONGO_PORT");
const MONGO_HOST = getEnv("MONGO_HOST");
export const MONGO_DB = getEnv("MONGO_DB");
export const DATABASE_URI = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

// Redis
export const REDIS_PORT = Number(getEnv("REDIS_PORT"));
export const REDIS_HOST = getEnv("REDIS_HOST");
export const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");

// Swagger
export const SWAGGER_PATH = getEnv("SWAGGER_PATH");

// Project
export const DEFAULT_USER_PASSWORD = getEnv("DEFAULT_USER_PASSWORD");

//Service
export const APIKEY = getEnv("API_KEY");
export const PAYMENT_SERVICE = getEnv("PAYMENT_SERVICE");
