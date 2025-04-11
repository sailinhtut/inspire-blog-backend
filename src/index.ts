import express from 'express';
import postRouter from './router/post_router';
import categoryRouter from './router/category_router';
import logger from './util/logger';
import loggerMiddleware from './middleware/logger_middleware';
import { AppDataSource } from './service/typeorm_service';
import path from 'path';

import config from './config/config';
import scheduleTasks from './service/backup_service';
import appRouter from './router/app_router';

const app = express();
const port = config.serverPort;

app.use(express.json()); // Json Payload
app.use(express.urlencoded({ extended: true })); // URL Payload
app.use(loggerMiddleware); // Logging

app.use('/storage', express.static(path.join(__dirname, '../storage')));

app.use('/api', postRouter);
app.use('/api', categoryRouter);
app.use('/', appRouter);

scheduleTasks();

AppDataSource.initialize()
	.then(() => {
		logger.info('MySQL Database connected');

		const server = app.listen(port, () => {
			logger.info(`Server is running on http://localhost:${port}`);
		});

		server.on('error', (err) => {
			logger.error(`Server encountered an error: ${err.message}`);
		});
	})
	.catch((err) => logger.error('Database connection error:', err));
