import express from 'express';
import postRouter from './route/post_routes';
import config from './config/config';
import logger from './util/logger';
import loggerMiddleware from './middleware/logger_middleware';
import { AppDataSource } from './service/database_service';

const app = express();
const port = config.serverPort;

app.use(express.json()); // Json Payload
app.use(express.urlencoded({ extended: true })); // URL Payload
app.use(loggerMiddleware); // Logging

app.use('/api', postRouter);

AppDataSource.initialize()
	.then(() => {
		logger.debug('MySQL Database connected');

		const server = app.listen(port, () => {
			logger.info(`Server is running on http://localhost:${port}`);
		});

		server.on('error', (err) => {
			logger.error(`Server encountered an error: ${err.message}`);
		});
	})
	.catch((err) => logger.error('Database connection error:', err));
