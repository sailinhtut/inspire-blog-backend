"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config/config"));
const memoryInfoPath = path_1.default.join(config_1.default.storageDir, 'logs', 'info.log');
const memoryErrorPath = path_1.default.join(config_1.default.storageDir, 'logs', 'error.log');
const logger = winston_1.default.createLogger({
    level: 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'hh:mm:ss A MMM D YYYY' }), winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `[${level.toUpperCase()}] [${timestamp}] - ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console({
            level: 'debug',
            format: winston_1.default.format.combine(winston_1.default.format.printf(({ timestamp, level, message }) => {
                return `[${level.toUpperCase()}] [${timestamp}] - ${message}`;
            })),
        }),
        // File transport for 'info' level logs and above
        new winston_1.default.transports.File({
            filename: memoryInfoPath,
            level: 'info',
        }),
        // File transport for 'error' level logs only
        new winston_1.default.transports.File({
            filename: memoryErrorPath,
            level: 'error',
        }),
    ],
});
class Logger {
    static console(message) {
        logger.debug(message);
    }
    static saveInfo(message) {
        logger.info(message);
    }
    static saveError(message) {
        logger.error(message);
    }
}
exports.default = Logger;
