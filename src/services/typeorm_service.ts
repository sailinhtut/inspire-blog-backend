import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '../config/config';
import { Post } from '../models/post';
import { User } from '../models/user';

export const AppDataSource = new DataSource({
	type: 'mysql',
	host: config.db_host,
	port: config.db_port,
	username: config.db_user,
	password: config.db_password,
	database: config.db_name,
	synchronize: true,
	logging: false,
	entities: [User, Post],
});
