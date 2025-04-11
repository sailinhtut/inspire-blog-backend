import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '../config/config';
import { Post } from '../model/post';
import { Category } from '../model/category';

export const AppDataSource = new DataSource({
	type: 'mysql',
	host: config.db_host,
	port: config.db_port,
	username: config.db_user,
	password: config.db_password,
	database: config.db_name,
	synchronize: true,
	logging: false,
	entities: [Post, Category],
});
