"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
const id_generator_1 = require("../utils/id_generator");
const byte_formatter_1 = require("../utils/byte_formatter");
const file_operation_1 = require("../utils/file_operation");
class UploadService {
    static async moveUploadFile(uploadedFile, validation = {}) {
        try {
            const defaultRule = {
                desitnation: 'upload',
                filename: (0, id_generator_1.uniqueID)(14),
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
                maxSizeInBytes: 10 * 1024 * 1024,
            };
            const rule = {
                ...defaultRule,
                ...validation,
            };
            const uploadDir = path_1.default.join(config_1.default.publicFilesDir, rule.desitnation);
            const filename = `${(0, id_generator_1.uniqueID)(14)}${path_1.default.extname(uploadedFile.name)}`;
            const targetPath = path_1.default.join(uploadDir, filename);
            if (!rule.allowedMimeTypes.includes(uploadedFile.mimetype)) {
                throw new Error(`Invalid file extension: ${uploadedFile.mimetype}`);
            }
            if (uploadedFile.size > rule.maxSizeInBytes) {
                throw new Error(`File size exceeds limit: ${(0, byte_formatter_1.formatBytes)(uploadedFile.size)}`);
            }
            const targetDir = path_1.default.dirname(targetPath);
            await fs_1.promises.mkdir(targetDir, { recursive: true });
            await uploadedFile.mv(targetPath);
            return path_1.default.join(rule.desitnation, filename);
        }
        catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    static async removeUploadedFile(relativePath) {
        try {
            (0, file_operation_1.deleteFileIfExists)(config_1.default.publicFilesDir, relativePath);
        }
        catch (error) {
            throw new Error(`Remove failed: ${error.message}`);
        }
    }
}
exports.default = UploadService;
