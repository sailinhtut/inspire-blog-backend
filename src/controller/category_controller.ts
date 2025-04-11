import { Request, Response } from 'express';
import { AppDataSource } from '../service/typeorm_service';
import { Post, PostStatus } from '../model/post';
import logger from '../util/logger';
import { z } from 'zod';
import { Category } from '../model/category';
import CategoryService from '../service/resources/category_service';

export const categoryRepo = AppDataSource.getRepository(Category);

export class CategoryController {
	static async getCategories(req, res) {
		try {
			const page = parseInt(req.query.page) || 1;
			const size = parseInt(req.query.size) || 10;

			const categories = await CategoryService.getPagniatedCateogries({
				page: page,
				size: size,
			});

			res.json(categories);
		} catch (error) {
			logger.error(`CATEGORY-CONTROLLER-GET-CATEGORIES: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async getCategory(req: Request, res) {
		try {
			const category = await CategoryService.getCategory(parseInt(req.params.id));

			if (!category) {
				res.status(404).json({ message: 'No Category Found' });
			}

			res.json(category);
		} catch (error) {
			logger.error(`CATEGORY-CONTROLLER-GET-CATEGORIY: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async addCategory(req, res) {
		try {
			const categoryCreateSchema = z.object({
				name: z.string().min(1).max(255),
				description: z.string().min(1).optional(),
			});
			const validated = categoryCreateSchema.safeParse(req.body);
			if (!validated.success) {
				res.status(400).json({
					message: 'Invlaid Data',
					errors: validated.error.flatten().fieldErrors,
				});
			}

			const { name, description } = req.body;

			const createdCategory = await CategoryService.addCategory({
				name: name,
				description: description,
			});

			res.status(201).json(createdCategory);
		} catch (error) {
			logger.error(`CATEGORY-CONTROLLER-ADD-CATEGORY: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async updateCategory(req: Request, res) {
		try {
			const category = await await CategoryService.getCategory(parseInt(req.params.id));

			if (!category) {
				res.status(404).json({ message: 'No Category Found' });
			}

			const categoryUpdateSchema = z.object({
				name: z.string().min(1).max(255).optional(),
				description: z.string().min(1).optional(),
			});

			const result = categoryUpdateSchema.safeParse(req.body);
			if (!result.success) {
				const errors = result.error.flatten().fieldErrors;
				logger.debug(errors);
				return res.status(400).json({ errors: errors });
			}

			const { name, description } = req.body;
			const updatedCategory = await CategoryService.updateCategory(
				parseInt(req.params.id),
				{ name: name, description: description }
			);

			res.json(updatedCategory);
		} catch (error) {
			logger.error(`CATEGORY-CONTROLLER-UPDATE-CATEGORY: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async deleteCategory(req: Request, res) {
		try {
			const category = await CategoryService.getCategory(parseInt(req.params.id));

			if (!category) {
				res.status(404).json({ message: 'No Category Found' });
			}

			const deleted = await CategoryService.deleteCategory(parseInt(req.params.id));

			if (!deleted) {
				res.status(500).json({ message: `Cannot deleted` });
			}
			res.json({ message: `${category.name} is deleted` });
		} catch (error) {
			logger.error(`CATEGORY-CONTROLLER-DELETE-CATEGORY: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}
}
