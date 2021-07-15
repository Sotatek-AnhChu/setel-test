import { MongooseModule, MongooseModuleOptions } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as mongoose from "mongoose";

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) => {
  return MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });
};

export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};

export const clearMongodb = async (connection: mongoose.Connection) => {
  const collections = connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
