"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipFile = zipFile;
exports.zipFolder = zipFolder;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
function zipFile(inputPath, outputPath, onClose) {
    const output = fs_1.default.createWriteStream(outputPath);
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    output.on('close', () => onClose(outputPath));
    archive.on('error', (err) => logging_service_1.default.saveError(`Archive Error: ${err.message}`));
    archive.pipe(output);
    archive.file(inputPath, { name: path_1.default.basename(inputPath) });
    archive.on('entry', () => archive.finalize());
}
// Zip a folder with progress and entry-based finalize
function zipFolder(inputFolderPath, outputPath, onClose) {
    const output = fs_1.default.createWriteStream(outputPath);
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    output.on('close', () => onClose(outputPath));
    archive.on('error', (err) => logging_service_1.default.saveError(`Archive Error: ${err.message}`));
    archive.pipe(output);
    archive.directory(inputFolderPath, false);
    let finalized = false;
    archive.on('entry', () => {
        if (!finalized) {
            finalized = true;
            archive.finalize();
        }
    });
}
