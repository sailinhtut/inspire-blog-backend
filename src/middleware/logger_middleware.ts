import { Request, Response, NextFunction } from 'express';
import logger from '../util/logger';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	logger.debug(`${req.method} ${req.originalUrl}`);
	next();
};

export default loggerMiddleware;
