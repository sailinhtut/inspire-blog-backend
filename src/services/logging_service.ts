import path from 'path';
import winston from 'winston';
import config from '../config/config';

const memoryInfoPath = path.join(config.storageDir, 'logs', 'info.log');
const memoryErrorPath = path.join(config.storageDir, 'logs', 'error.log');

const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.combine(
		winston.format.timestamp({ format: 'hh:mm:ss A MMM D YYYY' }),
		winston.format.printf(({ timestamp, level, message }) => {
			return `[${level.toUpperCase()}] [${timestamp}] - ${message}`;
		})
	),
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: winston.format.combine(
				winston.format.printf(({ timestamp, level, message }) => {
					return `[${level.toUpperCase()}] [${timestamp}] - ${message}`;
				})
			),
		}),
		// File transport for 'info' level logs and above
		new winston.transports.File({
			filename: memoryInfoPath,
			level: 'info',
		}),
		// File transport for 'error' level logs only
		new winston.transports.File({
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

export default Logger;
