import { Request, Response } from 'express';
import { AppDataSource } from '../service/typeorm_service';
import { Post, PostStatus } from '../model/post';
import logger from '../util/logger';
import { z } from 'zod';
import { categoryRepo } from './category_controller';
import PostService from '../service/resources/post_service';
import CategoryService from '../service/resources/category_service';
import { triggerAsyncId } from 'async_hooks';
import path from 'path';
import { deleteFileIfExists } from '../util/file_utils';

export const postRepo = AppDataSource.getRepository(Post);

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class PostController {
	static async getPosts(req, res) {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const size = parseInt(req.query.size as string) || 10;

			const posts = await PostService.getPagniatedPosts({ page: page, size: size });

			res.json(posts);
		} catch (error) {
			logger.error(`PostController-GET POSTS: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async getPost(req: Request, res) {
		try {
			const post = await PostService.getPost(parseInt(req.params.id));
			if (!post) {
				res.status(404).json({ message: 'No Post Found' });
			}
			res.json(post);
		} catch (error) {
			logger.error(`PostController-GET POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async addPost(req: Request, res) {
		try {
			const postCreateSchema = z.object({
				title: z.string().min(1).max(255),
				content: z.string().min(1),
				status: z.nativeEnum(PostStatus).optional(),
				category_id: z.string().min(1),
				tags: z.array(z.string()).optional(),
				header_image: z.any().optional(),
			});
			const validated = postCreateSchema.safeParse(req.body);
			if (!validated.success) {
				return res.status(400).json({
					message: 'Invlaid Data',
					errors: validated.error.flatten().fieldErrors,
				});
			}

			const { title, content, status, category_id, tags } = req.body;

			const existedCategory = await CategoryService.getCategory(category_id);

			if (!existedCategory) {
				return res.status(400).json({ message: 'Invalid category_id: Category not found' });
			}

			const headerImage = req.files
				? (req.files as Express.Multer.File[]).find(
						(file) => file.fieldname === 'header_image'
				  )
				: undefined;
			const savedPath = headerImage ? path.join('posts', headerImage.filename) : undefined;

			const createdPost = await PostService.addPost({
				title: title,
				content: content,
				status: status,
				category_id: category_id,
				tags: tags,
				headerImage: savedPath,
			});

			res.status(201).json(createdPost.toJsonResponse());
		} catch (error) {
			logger.error(`PostController-ADD POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async updatePost(req: Request, res) {
		try {
			const post = await PostService.getPost(parseInt(req.params.id));

			if (!post) {
				res.status(404).json({ message: 'No Post Found' });
			}

			const postUpdateSchema = z.object({
				title: z.string().min(1).max(255).optional(),
				content: z.string().min(1).optional(),
				status: z.nativeEnum(PostStatus).optional(),
				category_id: z.number().int().positive().optional(),
				tags: z.array(z.string()).optional(),
				header_image: z.any().optional(),
			});

			const result = postUpdateSchema.safeParse(req.body);
			if (!result.success) {
				const errors = result.error.flatten().fieldErrors;
				logger.debug(errors);
				return res.status(400).json({ errors: errors });
			}

			const { title, content, status, category_id, tags } = req.body;

			if (category_id) {
				const existedCategory = await CategoryService.getCategory(category_id);
				if (!existedCategory) {
					res.status(400).json({
						message: 'Invalid category_id: Category not found',
					});
				}
				post.category = existedCategory;
			}

			const headerImage = req.files
				? (req.files as Express.Multer.File[]).find(
						(file) => file.fieldname === 'header_image'
				  )
				: undefined;
			const savedHeaderImagePath = headerImage
				? path.join('posts', headerImage.filename)
				: undefined;

			if (headerImage) {
				if (!ALLOWED_IMAGE_TYPES.includes(headerImage.mimetype)) {
					logger.debug(`Saved Path : ${headerImage.path}`);
					deleteFileIfExists(headerImage.path); // clean up
					return res.status(400).json({
						message: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.',
					});
				}

				if (headerImage.size > MAX_FILE_SIZE) {
					logger.debug(`Saved Path : ${headerImage.path}`);
					deleteFileIfExists(headerImage.path);
					return res
						.status(400)
						.json({ message: 'File too large. Max size is 5MB.' });
				}
			}

			if (post.headerImage) {
				logger.debug(`Existed Post ${post.id} : ${post.headerImage}`);
				deleteFileIfExists(post.headerImage);
			}

			const updatedPost = await PostService.updatePost(parseInt(req.params.id), {
				title: title,
				content: content,
				status: status,
				category_id: category_id,
				tags: tags,
				headerImage: savedHeaderImagePath,
			});

			res.json(updatedPost.toJsonResponse());
		} catch (error) {
			logger.error(`PostController-ADD POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async deletePost(req: Request, res) {
		try {
			const post = await PostService.getPost(parseInt(req.params.id));

			if (!post) {
				res.status(404).json({ message: 'No Post Found' });
			}
			const deleted = await PostService.deletePost(post.id);

			if (!deleted) {
				res.status(500).json({ message: `Cannot deleted` });
			}

			res.json({ message: `${post.title} is deleted` });
		} catch (error) {
			logger.error(`PostController-Delete POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}
}
