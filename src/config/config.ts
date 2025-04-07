import dotenv from 'dotenv';

dotenv.config();

export default {
	serverPort: process.env.SERVER_PORT,

	// Database Connection
	db_host: process.env.DB_HOST,
	db_port: parseInt(process.env.DB_PORT),
	db_name: process.env.DB_NAME, 
	db_user: process.env.DB_USERNAME,
	db_password: process.env.DB_PASSWORD,
};
