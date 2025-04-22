"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.default = {
    /** Server Configs */
    host: process.env.HOST,
    serverPort: process.env.SERVER_PORT,
    /** Database Connection */
    db_host: process.env.DB_HOST,
    db_port: parseInt(process.env.DB_PORT),
    db_name: process.env.DB_NAME,
    db_user: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
    /** File Operations Paths */
    rootDir: process.cwd(),
    storageDir: path_1.default.join(process.cwd(), 'storage'),
    publicFilesDir: path_1.default.join(process.cwd(), 'storage', 'public'),
    privateFilesDir: path_1.default.join(process.cwd(), 'storage', 'private'),
    backupDir: path_1.default.join(process.cwd(), 'storage', 'backup'),
    tempDir: path_1.default.join(process.cwd(), 'storage', 'temp'),
    logDir: path_1.default.join(process.cwd(), 'storage', 'logs'),
    /** Security */
    jwt_secret: '4fd7f4a8cb8bb9afd565e0d8a973f23c4f1c841862385b6c73d0defc5fadf65e',
    /** Mailing */
    smpt_server: process.env.SMTP_SERVER,
    smpt_user: process.env.SMTP_USER,
    smpt_password: process.env.SMTP_PASSWORD,
};
