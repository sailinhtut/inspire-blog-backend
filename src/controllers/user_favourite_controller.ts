import { Request, Response } from 'express';
import Logger from '../services/logging_service';
import UserFavouriteService from '../services/resources/user_favourite_service';
import { body, validationResult } from 'express-validator';
import { formatValidationErrors } from '../utils/validator_formatter';
import PostService from '../services/resources/post_service';

export class UserFavouriteController {
	static addValidator = [
		body('post_id')
			.notEmpty()
			.withMessage('post_id is required')
			.isInt()
			.withMessage('Post ID must be an integer'),
	];
	static removeValidator = [
		body('post_id')
			.notEmpty()
			.withMessage('post_id is required')
			.isInt()
			.withMessage('Post ID must be an integer'),
	];

	static async getUserFavourites(req: Request, res: Response) {
		try {
			const userId = parseInt(req.params.id);
			const favourites = await UserFavouriteService.getFavoritesByUser(userId);
			const data = favourites.map((post) => post.toJsonResponse());
			res.json(data);
		} catch (error) {
			Logger.saveError(`USER-FAVOURITE-CONTROLLER-GET-USER-FAVOURITES: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async addFavourite(req, res) {
		try {
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

			const userId = req.params.id;
			const { post_id } = req.body;

			const post = await PostService.getPost(post_id);
			if (!post) {
				return res.status(404).json({ message: 'Post Not Found' });
			}

			const favourite = await UserFavouriteService.addFavorite(userId, post_id);

			return res.status(201).json(favourite.toJsonResponse());
		} catch (error) {
			Logger.saveError(`USER-FAVOURITE-CONTROLLER-ADD-FAVOURITE: ${error}`);
			return res.status(500).json({ message: (error as Error).message });
		}
	}

	static async removeFavourite(req, res) {
		try {
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

			const userId = req.params.id;
			const { post_id } = req.body;

			const removed = await UserFavouriteService.removeFavorite(
				parseInt(userId as string),
				parseInt(post_id as string)
			);

			if (!removed) {
				return res.status(404).json({ message: 'Favourite not found' });
			}

			return res.json({ message: 'Removed from favourites' });
		} catch (error) {
			Logger.saveError(`USER-FAVOURITE-CONTROLLER-REMOVE-FAVOURITE: ${error}`);
			return res.status(500).json({ message: (error as Error).message });
		}
	}
}
