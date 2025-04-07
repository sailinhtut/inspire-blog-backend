import winston from 'winston';


// Create the logger
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
			filename: 'logs/info.log',
			level: 'info',
		}),
		// File transport for 'error' level logs only
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
		}),
	],
});

export default logger;
