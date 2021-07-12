import * as mongoose from "mongoose";
import { DATABASE_URI } from "../config/secrets";
import { red } from "chalk";

export class MongoTool {
    static initialize() {
        mongoose.connect(DATABASE_URI, {
            useFindAndModify: false,
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        mongoose.connection.on("error", (err) => {
            console.error(err);
            console.log(`${red("✗")} MongoDB connection error. Please make sure MongoDB is running.`);
            process.exit();
        });
    }
}
