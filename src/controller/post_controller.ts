import { Request, Response } from 'express';
import { AppDataSource } from '../service/database_service';
import { Post } from '../model/post';
import logger from '../util/logger';

const postRepo = AppDataSource.getRepository(Post);

export const getAllPosts = async (_: Request, res: Response) => {
	try {
		const posts = await postRepo.find();
		res.json(posts);
	} catch (error) {
		logger.error(`Failed to fetch posts: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createPost = async (req: Request, res: Response) => {
	try {
		
		const { title, content } = req.body;

		if (!title || !content) {
			res.status(400).json({ message: 'Title and content are required' });
		}

		const newPost = postRepo.create({ title, content });
		const savedPost = await postRepo.save(newPost);
		res.status(201).json(savedPost);
	} catch (error) {
		logger.error(`Failed to create post: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
};
