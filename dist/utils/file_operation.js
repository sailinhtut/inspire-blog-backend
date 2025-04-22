"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileIfExists = deleteFileIfExists;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
function deleteFileIfExists(...deletePath) {
    try {
        const filePath = path_1.default.join(...deletePath);
        logging_service_1.default.console(filePath);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            logging_service_1.default.console(`Deleted old file: ${filePath}`);
        }
    }
    catch (error) {
        throw new Error(`Delete Failed: ${error.message}`);
    }
}
