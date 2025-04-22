"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBackUpToGoogleDrive = uploadBackUpToGoogleDrive;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const config_1 = __importDefault(require("../config/config"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
const zipper_1 = require("./zipper");
const backup_service_1 = require("../services/backup_service");
const moment_1 = __importDefault(require("moment"));
const KEYFILEPATH = path_1.default.join(config_1.default.privateFilesDir, 'service_accounts', 'inspire-dream-23e4ff5f1bf6.json');
const FOLDER_ID = '1gYkkYGtAhgF49ArxkRhMTluOHnwtGPrZ';
async function uploadFileToGoogleDrive(filePath) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const authClient = (await auth.getClient());
    const driveService = googleapis_1.google.drive({ version: 'v3', auth: authClient });
    const fileName = path_1.default.basename(filePath);
    const mimeType = mime_types_1.default.lookup(filePath) || 'application/octet-stream';
    const fileMetadata = {
        name: fileName,
        parents: [FOLDER_ID],
    };
    const media = {
        mimeType: mimeType,
        body: fs_1.default.createReadStream(filePath),
    };
    const fileSize = fs_1.default.statSync(filePath).size;
    try {
        const res = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name',
        }, {
            onUploadProgress: (event) => {
                const progress = (event.bytesRead / fileSize) * 100;
                logging_service_1.default.console(`Uploaded ${progress.toFixed(2)}%`);
            },
        });
        logging_service_1.default.console(`✅ Uploaded: ${res.data.name} (ID: ${res.data.id})`);
    }
    catch (error) {
        logging_service_1.default.console(`Error uploading file: ${error}`);
    }
}
// For `npm run upload-backup-data`
async function uploadBackUpToGoogleDrive() {
    const googleDriveBackUpFilename = (0, moment_1.default)().format('YYYY_MM_DD_hh_mm_A') + '.zip';
    (0, zipper_1.zipFolder)(config_1.default.backupDir, path_1.default.join(config_1.default.tempDir, googleDriveBackUpFilename), async (backupZipPath) => {
        logging_service_1.default.console('Staring Google Drive Upload');
        await uploadFileToGoogleDrive(backupZipPath);
        await (0, backup_service_1.clearTemporaryDir)();
    });
}
