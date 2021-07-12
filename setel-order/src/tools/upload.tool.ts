import multer = require("multer");
import { ForbiddenException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import * as fs from "fs";
import { Document, model, Schema } from "mongoose";
import * as sharp from "sharp";
import { parse } from "url";
import { MSG } from "../config/constants.js";
import { SERVER_ADDRESS } from "../config/secrets";
import { StringTool } from "./string.tool";

export enum EUploadFolder {
    IMAGE = "images",
    DOCUMENT = "documents",
    DATA = "data",
    LANG_CERTIFICATE = "data/language-certificate",
}

export const UPLOAD_PATH_MODEL = "UploadPath";

export const UploadPathSchema = new Schema(
    {
        folder: {
            type: String,
            enum: Object.values(EUploadFolder),
        },
        url: String,
        path: String,
    },
    { timestamps: true, collection: "UploadPath" },
);

export class UploadPath {
    folder: string;
    url: string;
    filePath: string;
}

export interface UploadPathDocument extends UploadPath, Document {}
export class UploadTool {
    private static readonly uploadPathModel = model<UploadPathDocument>(UPLOAD_PATH_MODEL, UploadPathSchema);

    private static createUploadPath(folder: EUploadFolder, url: string, filePath: string): Promise<UploadPathDocument> {
        return this.uploadPathModel.create({ folder, url, path: filePath });
    }

    private static isImageFile(fileMimetype: string) {
        return ["image/img", "image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(fileMimetype);
    }

    static getURL(directory: EUploadFolder, filename: string) {
        return `${SERVER_ADDRESS}/${directory}/${filename}`;
    }

    static getURLMultiDir(directory: string, filename: string) {
        return `${SERVER_ADDRESS}/${directory}/${filename}`;
    }

    static getPath(fileUrl: string) {
        return `./uploads${decodeURIComponent(parse(fileUrl).pathname)}`;
    }

    static imageCompress = async (file: any, quality: number): Promise<any> => {
        await sharp(file.path)
            .toFormat("jpeg")
            .jpeg({
                quality,
            })
            .toBuffer()
            .then((data) => {
                return fs.writeFileSync(file.path, data);
            });
    };

    static imageUpload: MulterOptions = {
        storage: multer.diskStorage({
            destination: `./uploads/${EUploadFolder.IMAGE}`,
            filename: async (req: Express.Request, file: Express.Multer.File, cb) => {
                const safeName = StringTool.normalizeFileName(file.originalname);
                const filename = `${file.fieldname}-${Date.now()}-${safeName}`;
                if (!UploadTool.isImageFile(file.mimetype)) {
                    return cb(new ForbiddenException(403, MSG.UPLOAD.IMAGE_FILE_TYPE_ONLY), filename);
                }
                const url = UploadTool.getURL(EUploadFolder.IMAGE, filename);
                const filePath = UploadTool.getPath(url);
                await UploadTool.createUploadPath(EUploadFolder.IMAGE, url, filePath);
                cb(null, filename);
            },
        }),
    };
}
