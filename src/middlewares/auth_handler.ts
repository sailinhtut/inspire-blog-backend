import { Request, Response, NextFunction } from 'express';
import JWT from '../utils/json_web_token';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import UserService from '../services/resources/user_service';

const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ message: 'Unauthorized Access' });
		return;
	}
	const token = authHeader.split(' ')[1];

	try {
		const payload = JWT.verifyToken(token);
		const user = await UserService.getUser(payload.id);

		if (!user) {
			res.status(404).json({ message: 'No User Found' });
		}

		(req as any).user = user;
		next();
	} catch (err) {
		if (err instanceof TokenExpiredError) {
			res.status(401).json({ message: 'Expired Token' });
		} else if (err instanceof JsonWebTokenError) {
			res.status(401).json({ message: 'Invalid Token' });
		}
		res.status(500).json({ message: 'Authentication error', error: (err as Error).message });
	}
};

export default authHandler;
