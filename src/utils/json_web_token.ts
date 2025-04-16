import jwt from 'jsonwebtoken';
import config from '../config/config';

const SECRET = config.jwt_secret; // Use environment variable in production

class JWT {
	static generateToken(payload: any, { expiresIn = '7d' }: { expiresIn: string }): string {
		return jwt.sign(payload, SECRET, { expiresIn: expiresIn });
	}

	static verifyToken(token: string) {
		return jwt.verify(token, SECRET);
	}
}

export default JWT;
