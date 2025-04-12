import { Request, Response, NextFunction } from 'express';

const responseErrorHandlerMiddleware = (err, req: Request, res: Response, next: NextFunction) => {
	res.status(500).json({ message: 'Server Error', error: err.message });
};

export default responseErrorHandlerMiddleware;
