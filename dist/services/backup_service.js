"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupDatabase = backupDatabase;
exports.backupStorage = backupStorage;
exports.clearTemporaryDir = clearTemporaryDir;
exports.clearLogDir = clearLogDir;
exports.default = scheduleTasks;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const child_process_1 = require("child_process");
const config_1 = __importDefault(require("../config/config"));
const node_cron_1 = __importDefault(require("node-cron"));
const logging_service_1 = __importDefault(require("./logging_service"));
const byte_formatter_1 = require("../utils/byte_formatter");
const moment_1 = __importDefault(require("moment"));
const zipper_1 = require("../utils/zipper");
async function backupDatabase() {
    const rootBackupDir = path_1.default.join(config_1.default.backupDir, 'database');
    const schemaDir = path_1.default.join(rootBackupDir, 'schema');
    const dataDir = path_1.default.join(rootBackupDir, 'data');
    fs_1.default.mkdirSync(schemaDir, { recursive: true });
    fs_1.default.mkdirSync(dataDir, { recursive: true });
    const timestamp = (0, moment_1.default)().format('YYYY_MM_DD_hh_mm_A');
    const schemaSqlPath = path_1.default.join(schemaDir, 'schema.sql');
    const schemaZipPath = path_1.default.join(schemaDir, 'schema.zip');
    const dataSqlPath = path_1.default.join(dataDir, 'data.sql');
    const dataZipPath = path_1.default.join(dataDir, `${timestamp}.zip`);
    const dbUser = config_1.default.db_user;
    const dbPassword = config_1.default.db_password;
    const dbName = config_1.default.db_name;
    const passPart = dbPassword ? `-p${dbPassword}` : '';
    // Dump schema only
    const dumpSchemaCommand = `mysqldump -u ${dbUser} ${passPart} --no-data ${dbName} > "${schemaSqlPath}"`;
    // Dump data only
    const dumpDataCommand = `mysqldump -u ${dbUser} ${passPart} --no-create-info ${dbName} > "${dataSqlPath}"`;
    // Run schema dump
    (0, child_process_1.exec)(dumpSchemaCommand, (schemaErr) => {
        if (schemaErr)
            return logging_service_1.default.saveError(`Schema Backup Error: ${schemaErr.message}`);
        (0, zipper_1.zipFile)(schemaSqlPath, schemaZipPath, () => {
            fs_1.default.unlinkSync(schemaSqlPath);
            logging_service_1.default.saveInfo(`Schema Backup Saved: ${schemaZipPath}`);
        });
    });
    // Run data dump
    (0, child_process_1.exec)(dumpDataCommand, (dataErr) => {
        if (dataErr)
            return logging_service_1.default.saveError(`Data Backup Error: ${dataErr.message}`);
        (0, zipper_1.zipFile)(dataSqlPath, dataZipPath, () => {
            fs_1.default.unlinkSync(dataSqlPath);
            logging_service_1.default.saveInfo(`Data Backup Saved: ${dataZipPath}`);
        });
    });
}
async function backupStorage() {
    try {
        const backupDir = path_1.default.join(config_1.default.backupDir, 'disk');
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        const outputPath = path_1.default.join(backupDir, 'disk.zip');
        const output = fs_1.default.createWriteStream(outputPath);
        const archive = (0, archiver_1.default)('zip', {
            zlib: { level: 9 },
        });
        output.on('close', () => {
            const size = (0, byte_formatter_1.formatBytes)(archive.pointer());
            logging_service_1.default.saveInfo(`Disk Back Up Saved: ${outputPath} (${size})`);
        });
        archive.on('error', (err) => {
            throw err;
        });
        archive.on('progress', (progress) => {
            logging_service_1.default.console(`Zipping ${progress.entries.processed}/${progress.entries.total} (${(0, byte_formatter_1.formatBytes)(progress.fs.processedBytes)})`);
        });
        archive.pipe(output);
        // Add the entire storage folder to the archive
        const storagePath = path_1.default.join(config_1.default.publicFilesDir);
        archive.directory(storagePath, false);
        archive.finalize();
    }
    catch (error) {
        logging_service_1.default.saveError(`Error while zipping storage folder: ${error.message}`);
    }
}
async function clearTemporaryDir() {
    try {
        const sizeInBytes = (0, byte_formatter_1.getDirectorySize)(config_1.default.tempDir);
        fs_1.default.rmSync(config_1.default.tempDir, { recursive: true });
        fs_1.default.mkdirSync(config_1.default.tempDir, { recursive: true });
        logging_service_1.default.console(`Cleared Temporary Directory (${(0, byte_formatter_1.formatBytes)(sizeInBytes)})`);
    }
    catch (error) {
        logging_service_1.default.saveError(`Error while clearing temp folder: ${error.message}`);
    }
}
async function clearLogDir() {
    try {
        const sizeInBytes = (0, byte_formatter_1.getDirectorySize)(config_1.default.logDir);
        fs_1.default.rmSync(config_1.default.logDir, { recursive: true });
        fs_1.default.mkdirSync(config_1.default.logDir, { recursive: true });
        logging_service_1.default.console(`Cleared Log Directory (${(0, byte_formatter_1.formatBytes)(sizeInBytes)})`);
    }
    catch (error) {
        logging_service_1.default.saveError(`Error while clearing log folder: ${error.message}`);
    }
}
function scheduleTasks() {
    node_cron_1.default.schedule('*/10 * * * *', () => {
        backupDatabase();
    });
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        backupStorage();
    });
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        // uploadBackUpToGoogleDrive();
    });
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        clearTemporaryDir();
    });
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        clearLogDir();
    });
}
