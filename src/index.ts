import express from 'express';
import { AppDataSource } from './services/typeorm_service';

import config from './config/config';
import scheduleTasks from './services/backup_service';

import requestLoggerMiddleware from './middlewares/request_logger';
import responseErrorHandlerMiddleware from './middlewares/error_handler';
import Logger from './services/logging_service';
import postRouter from './routes/post_router';
import appRouter from './routes/app_router';
import formDataResolver from './middlewares/form_data_resolver';
import authRouter from './routes/auth_router';
import './types';

const app = express();
const port = config.serverPort;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(formDataResolver);

app.use('/share', express.static(config.publicFilesDir));
app.use('/api', postRouter);
app.use('/api', authRouter);
app.use('/', appRouter);

app.use(responseErrorHandlerMiddleware);

// scheduleTasks();
Logger.console(JSON.stringify(config));

AppDataSource.initialize()
	.then(() => {
		Logger.saveInfo('MySQL Database connected');

		const server = app.listen(5000, '0.0.0.0', () => {
			Logger.console(`Server is running on http://0.0.0.0:${port}`);
			Logger.console(config);
			Logger.saveInfo(`Server is running on http://0.0.0.0:${port}`);
		});

		server.on('error', (err) => {
			Logger.saveError(`Server encountered an error: ${err.message}`);
		});
	})
	.catch((err) => Logger.saveError(`Database connection error: ${err}`));
