"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageDownloadURL = storageDownloadURL;
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
function storageDownloadURL(...relativePath) {
    const downloadPath = path_1.default.join('share', ...relativePath);
    return config_1.default.host + '/' + downloadPath.replaceAll('\\', '/');
}
