import { Request, Response } from 'express';
import { AppDataSource } from '../services/typeorm_service';
import { Post, PostStatus } from '../models/post';
import { z } from 'zod';
import { categoryRepo } from './category_controller';
import PostService from '../services/resources/post_service';
import CategoryService from '../services/resources/category_service';
import { triggerAsyncId } from 'async_hooks';
import path from 'path';
import { deleteFileIfExists } from '../utils/file_operation';
import { rollbackMulterUploaded } from '../services/upload_service';
import Logger from '../services/logging_service';

export const postRepo = AppDataSource.getRepository(Post);

export class PostController {
	static async getPosts(req, res) {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const size = parseInt(req.query.size as string) || 10;

			const posts = await PostService.getPagniatedPosts({ page: page, size: size });

			res.json(posts);
		} catch (error) {
			Logger.saveError(`PostController-GET POSTS: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async getPost(req: Request, res) {
		try {
			const post = await PostService.getPost(parseInt(req.params.id));
			if (!post) {
				res.status(404).json({ message: 'No Post Found' });
			}
			res.json(post.toJsonResponse());
		} catch (error) {
			Logger.saveError(`PostController-GET POST: ${error}`);
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
				return PostController.errorResponse(req, res, 400, {
					message: 'Invalid Data',
					errors: validated.error.flatten().fieldErrors,
				});
			}

			const { title, content, status, category_id, tags } = req.body;

			const existedCategory = await CategoryService.getCategory(category_id);

			if (!existedCategory) {
				return PostController.errorResponse(req, res, 400, {
					message: 'Invalid category_id: Category not found',
				});
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
			Logger.saveError(`PostController-ADD POST: ${error}`);
			return PostController.errorResponse(req, res, 500, {
				message: (error as Error).message,
			});
		}
	}

	static async updatePost(req: Request, res) {
		try {
			const post = await PostService.getPost(parseInt(req.params.id));

			if (!post) {
				return PostController.errorResponse(req, res, 404, {
					message: 'Not Post Found',
				});
			}

			const postUpdateSchema = z.object({
				title: z.string().min(1).max(255).optional(),
				content: z.string().min(1).optional(),
				status: z.nativeEnum(PostStatus).optional(),
				category_id: z.string().min(1).optional(),
				tags: z.array(z.string()).optional(),
				header_image: z.any().optional(),
			});

			const result = postUpdateSchema.safeParse(req.body);
			if (!result.success) {
				return PostController.errorResponse(req, res, 400, {
					message: 'Invalid Data',
					errors: result.error.flatten().fieldErrors,
				});
			}

			const { title, content, status, category_id, tags } = req.body;

			if (category_id) {
				const existedCategory = await CategoryService.getCategory(category_id);
				if (!existedCategory) {
					return PostController.errorResponse(req, res, 400, {
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
			if (post.headerImage) {
				Logger.console(`Existed Post ${post.id} : ${post.headerImage}`);
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
			Logger.saveError(`PostController-PUT POST: ${error}`);
			return PostController.errorResponse(req, res, 500, {
				message: (error as Error).message,
			});
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

			if (post.headerImage) {
				deleteFileIfExists(post.headerImage);
			}

			res.json({ message: `${post.title} is deleted` });
		} catch (error) {
			Logger.saveError(`PostController-Delete POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static errorResponse(req, res, statusCode, object): any {
		rollbackMulterUploaded(req.files as Express.Multer.File[]);
		return res.status(statusCode).json(object);
	}
}
