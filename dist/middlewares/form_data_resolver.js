"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
const formDataResolver = (0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: path_1.default.join(config_1.default.tempDir), // Use OS temp dir or Project-Based temp dir
});
exports.default = formDataResolver;
