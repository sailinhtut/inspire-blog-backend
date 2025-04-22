import { Request, Response } from 'express';
import { AppDataSource } from '../services/typeorm_service';
import { Post, PostStatus } from '../models/post';
import { z } from 'zod';
import PostService from '../services/resources/post_service';
import path from 'path';
import Logger from '../services/logging_service';
import { body, header, validationResult } from 'express-validator';
import { formatValidationErrors } from '../utils/validator_formatter';
import config from '../config/config';
import { uniqueID } from '../utils/id_generator';
import UploadService from '../services/upload_service';
import { storageDownloadURL } from '../utils/path_resolver';

export class PostController {
	static addValidator = [
		body('title')
			.notEmpty()
			.withMessage('Title is required')
			.isLength({ max: 255 })
			.withMessage('Title is too long'),
		body('content').notEmpty().withMessage('Content is required'),
		body('status')
			.isIn(Object.values(PostStatus))
			.withMessage('Status must be one of: publish, draft, archive'),
		body('tags')
			.notEmpty()
			.withMessage('Tags is required')
			.customSanitizer((value) => {
				if (typeof value === 'string') {
					return [value];
				}
				return value;
			})
			.isArray({ min: 1 })
			.withMessage('Tags must be a non-empty array'),
		body('tags.*').isString().withMessage('Each tag must be a string'),
	];

	static updateValidator = [
		body('title').optional().isLength({ max: 255 }).withMessage('Title is too long'),
		body('content').optional(),
		body('status')
			.optional()
			.isIn(Object.values(PostStatus))
			.withMessage('Status must be one of: publish, draft, archive'),
		body('tags')
			.optional()
			.customSanitizer((value) => {
				if (typeof value === 'string') {
					return [value];
				}
				return value;
			})
			.isArray({ min: 1 })
			.withMessage('Tags must be a non-empty array'),
		body('tags.*').isString().withMessage('Each tag must be a string'),
		body('remove_header_image')
			.optional()
			.isBoolean()
			.withMessage('isActive must be a boolean (true or false)')
			.toBoolean(),
	];

	static async getPosts(req, res) {
		try {
			if (req.query === undefined) {
				req.query = {};
			}

			if (req.query.search) {
				const foundPosts = await PostService.searchPost(req.query.search);
				const data = foundPosts.map((post) => post.toJsonResponse());
				return res.json(data);
			}

			if (req.query.tags) {
				const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
				const foundPosts = await PostService.searchPostsByTags(tags);
				const data = foundPosts.map((post) => post.toJsonResponse());
				return res.json(data);
			}

			const page = parseInt(req.query.page as string) || 1;
			const size = parseInt(req.query.size as string) || 10;

			const posts = await PostService.getPagniatedPosts({ page: page, size: size });

			res.json(posts);
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-GET-POSTS: ${error}`);
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
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Invalid Data Provided',
					errors: formatValidationErrors(errors.array()),
				});
			}

			let header_image_url = null;
			if (req.files && req.files['header_image']) {
				const uploadedFile = req.files['header_image'];
				const url = await UploadService.moveUploadFile(uploadedFile, {
					desitnation: 'posts',
					maxSizeInBytes: 2 * 1024 * 1024,
				});
				header_image_url = url;
			}

			const { title, content, status, tags } = req.body;

			const createdPost = await PostService.addPost({
				title: title,
				content: content,
				status: status,
				tags: tags,
				headerImage: header_image_url,
			});

			res.status(201).json(createdPost.toJsonResponse());
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-ADD-POST: ${error}`);
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

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Invalid Data Provided',
					errors: formatValidationErrors(errors.array()),
				});
			}
			if (req.body === undefined) {
				req.body = {};
			}

			let header_image_url = post.headerImage;

			if (req.body.remove_header_image && post.headerImage) {
				await UploadService.removeUploadedFile(post.headerImage);
				header_image_url = null;
			}

			if (req.files && req.files['header_image']) {
				const uploadedFile = req.files['header_image'];
				const url = await UploadService.moveUploadFile(uploadedFile, {
					desitnation: 'posts',
					maxSizeInBytes: 2 * 1024 * 1024,
				});
				header_image_url = url;

				// clear previous header image
				if (post.headerImage) {
					await UploadService.removeUploadedFile(post.headerImage);
				}
			}

			const { title, content, status, tags } = req.body;

			const updatedPost = await PostService.updatePost(parseInt(req.params.id), {
				title: title,
				content: content,
				status: status,
				tags: tags,
				headerImage: header_image_url,
			});

			res.json(updatedPost.toJsonResponse());
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-UPDATE-POST: ${error}`);
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
				await UploadService.removeUploadedFile(post.headerImage);
			}

			res.json({ message: `${post.title} is deleted` });
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-DELETE-POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static errorResponse(req, res, statusCode, object): any {
		return res.status(statusCode).json(object);
	}

	static async likePost(req, res) {
		try {
			const result = await PostService.likePost(req.params.id);
			if (!result) {
				return res.status(500).json({ message: 'Cannot like post' });
			}
			return res.json({ message: 'Post Updated Successfully' });
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-LIKE-POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async unlikePost(req, res) {
		try {
			const result = await PostService.unlikePost(req.params.id);
			if (!result) {
				return res.status(500).json({ message: 'Cannot unlike post' });
			}
			return res.json({ message: 'Post Updated Successfully' });
		} catch (error) {
			Logger.saveError(`POST-CONTROLLER-UNLIKE-POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}
}
