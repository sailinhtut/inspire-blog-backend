"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDatabase = restoreDatabase;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const unzipper_1 = __importDefault(require("unzipper"));
const child_process_1 = require("child_process");
const config_1 = __importDefault(require("../config/config"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
async function restoreDatabase(schemaZipPath, dataZipPath) {
    const tempDir = path_1.default.join(config_1.default.tempDir, 'database_restore');
    fs_1.default.mkdirSync(tempDir, { recursive: true });
    const schemaSQL = path_1.default.join(tempDir, 'schema.sql');
    const dataSQL = path_1.default.join(tempDir, 'data.sql');
    try {
        await unzip(schemaZipPath, schemaSQL);
        logging_service_1.default.console('Schema SQL extracted.');
        await unzip(dataZipPath, dataSQL);
        logging_service_1.default.console('Data SQL extracted.');
        await execPromise(getMysqlCommand(schemaSQL));
        logging_service_1.default.console('Schema restored successfully.');
        await execPromise(getMysqlCommand(dataSQL));
        logging_service_1.default.console('Data restored successfully.');
        fs_1.default.rmSync(schemaSQL, { recursive: true });
        fs_1.default.rmSync(dataSQL, { recursive: true });
        fs_1.default.rmSync(tempDir, { recursive: true });
    }
    catch (error) {
        logging_service_1.default.saveError(`Restore error: ${error.message}`);
    }
}
function unzip(zipPath, outputFilePath) {
    return new Promise((resolve, reject) => {
        const zipStream = fs_1.default.createReadStream(zipPath).pipe(unzipper_1.default.ParseOne());
        const outStream = fs_1.default.createWriteStream(outputFilePath);
        zipStream.on('error', reject);
        outStream.on('finish', resolve);
        zipStream.pipe(outStream);
    });
}
function getMysqlCommand(sqlPath) {
    const dbUser = config_1.default.db_user;
    const dbPassword = config_1.default.db_password;
    const dbName = config_1.default.db_name;
    const passPart = dbPassword ? `-p${dbPassword}` : '';
    return `mysql -u ${dbUser} ${passPart} ${dbName} < "${sqlPath}"`;
}
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
            if (err)
                return reject(err);
            if (stderr)
                logging_service_1.default.console(`Standard Error: ${stderr}`);
            resolve();
        });
    });
}
const schemaZipPath = path_1.default.join(config_1.default.backupDir, 'database', 'schema', 'schema.zip');
const dataZipPath = path_1.default.join(config_1.default.backupDir, 'database', 'data', '2025_04_16_08_50_PM.zip');
restoreDatabase(schemaZipPath, dataZipPath);
