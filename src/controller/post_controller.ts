import { Request, Response } from 'express';
import { AppDataSource } from '../service/database_service';
import { Post } from '../model/post';
import logger from '../util/logger';

const postRepo = AppDataSource.getRepository(Post);

export const getAllPosts = async (_: Request, res: Response) => {
	const posts = await postRepo.find();
	res.json(posts);
};

export const createPost = async (req: Request, res: Response) => {
	logger.info(JSON.stringify(req.body));
	const { title, content } = req.body;
	const newPost = postRepo.create({ title, content });
	const savedPost = await postRepo.save(newPost);
	res.status(201).json(savedPost);
};
