import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export default {
	/** Server Configs */
	host: process.env.HOST,
	serverPort: process.env.SERVER_PORT,

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
	backupDir: path.join(process.cwd(), 'storage', 'backup'),
	tempDir: path.join(process.cwd(), 'storage', 'temp'),
	logDir: path.join(process.cwd(), 'storage', 'logs'),
};
