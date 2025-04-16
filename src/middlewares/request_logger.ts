import { Request, Response, NextFunction } from 'express';
import Logger from '../services/logging_service';

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	Logger.console(`${req.method} ${req.originalUrl}`);
	next();
};

export default requestLoggerMiddleware;
