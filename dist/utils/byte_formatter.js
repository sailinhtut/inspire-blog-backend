"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBytes = formatBytes;
exports.getDirectorySize = getDirectorySize;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function getDirectorySize(directoryPath) {
    let totalSize = 0;
    function calculateSize(currentPath) {
        const stats = fs_1.default.statSync(currentPath);
        if (stats.isFile()) {
            totalSize += stats.size;
        }
        else if (stats.isDirectory()) {
            const entries = fs_1.default.readdirSync(currentPath);
            for (const entry of entries) {
                calculateSize(path_1.default.join(currentPath, entry));
            }
        }
    }
    calculateSize(directoryPath);
    return totalSize;
}
