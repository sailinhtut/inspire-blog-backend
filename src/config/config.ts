import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export default {
	/** Server Configs */
	host: process.env.HOST,
	serverPort: process.env.BACKEND_PORT,

	/** Database Connection */
	db_host: process.env.DB_HOST,
	db_port: parseInt(process.env.DB_PORT),
	db_name: process.env.DB_NAME,
	db_user: process.env.DB_USERNAME,
	db_password: process.env.DB_PASSWORD,

	/** File Operations Paths */
	rootDir: process.cwd(),
	storageDir: path.join(process.cwd(), 'storage'),
	publicFilesDir: path.join(process.cwd(), 'storage', 'public'),
	privateFilesDir: path.join(process.cwd(), 'storage', 'private'),
	backupDir: path.join(process.cwd(), 'storage', 'backup'),
	tempDir: path.join(process.cwd(), 'storage', 'temp'),
	logDir: path.join(process.cwd(), 'storage', 'logs'),

	/** Security */
	jwt_secret: '4fd7f4a8cb8bb9afd565e0d8a973f23c4f1c841862385b6c73d0defc5fadf65e',

	/** Mailing */
	smpt_server: process.env.SMTP_SERVER,
	smpt_user: process.env.SMTP_USER,
	smpt_password: process.env.SMTP_PASSWORD,
};
