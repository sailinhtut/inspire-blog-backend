import { body, validationResult } from 'express-validator';
import Logger from '../services/logging_service';
import { formatValidationErrors } from '../utils/validator_formatter';
import { Gender } from '../models/user';
import UserService from '../services/resources/user_service';
import UploadService from '../services/upload_service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import JWT from '../utils/json_web_token';

class AuthController {
	static registerValidator = [
		body('name')
			.notEmpty()
			.withMessage('Name is required')
			.isString()
			.withMessage('Name must be type of string')
			.isLength({ max: 100 })
			.withMessage('Name is too long'),
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Invalid Email Address'),
		body('password')
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 8 })
			.withMessage('Password must be greater than 8 letters'),
		body('gender').notEmpty().withMessage('Gender is required').isIn(Object.values(Gender)),
		body('birth')
			.optional()
			.isISO8601()
			.withMessage('Birth must be a valid ISO 8601 date')
			.toDate(),
	];
	static logInValidator = [
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Invalid Email Address'),
		body('password')
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 8 })
			.withMessage('Password must be greater than 8 letters'),
	];

	static updateValidator = [
		body('name')
			.optional()
			.isString()
			.withMessage('Name must be type of string')
			.isLength({ max: 100 })
			.withMessage('Name is too long'),
		body('gender').optional().isIn(Object.values(Gender)),
		body('birth')
			.optional()
			.isISO8601()
			.withMessage('Birth must be a valid ISO 8601 date')
			.toDate(),
	];

	static async getUsers(req, res) {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const size = parseInt(req.query.size as string) || 10;

			const users = await UserService.getPagniatedUsers({ page: page, size: size });

			res.json(users);
		} catch (error) {
			Logger.saveError(`PostController-GET POSTS: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async getUser(req: Request, res) {
		try {
			return res.json({ message: 'Get User', data: req.user });
		} catch (error) {
			Logger.saveError(`PostController-GET POST: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async register(req, res) {
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

			let profile_url = null;
			if (req.files && req.files['profile']) {
				const uploadedFile = req.files['profile'];
				const url = await UploadService.moveUploadFile(uploadedFile, {
					desitnation: 'users',
					maxSizeInBytes: 2 * 1024 * 1024,
				});
				profile_url = url;
			}

			const { name, email, password, gender, brith } = req.body;

			const hashPassword = await bcrypt.hash(password, 10);

			const createdUser = await UserService.addUser({
				name: name,
				email: email,
				password: hashPassword,
				gender: gender,
				birth: brith,
				profile: profile_url,
			});

			res.status(201).json(createdUser.toJsonResponse());
		} catch (error) {
			Logger.saveError(`AUTH-CONTROLLER-REGISTER: ${error}`);
			return res.status(500).json({ message: (error as Error).message });
		}
	}

	static async login(req, res) {
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

			const { email, password } = req.body;

			const user = await UserService.getUserByEmail(email);
			if (!user) {
				return res.status(404).json({ message: 'No User Found' });
			}

			const hashPassword = user.password;
			const correctPassword = await bcrypt.compare(password, hashPassword);
			if (!correctPassword) {
				return res.status(400).json({ message: 'Wrong Password' });
			}

			const apiToken = JWT.generateToken(
				{ id: user.id, email: user.email },
				{ expiresIn: '7d' }
			);

			res.json({
				messsage: 'Logged In Successfully',
				token: apiToken,
				user: user.toJsonResponse(),
			});
		} catch (error) {
			Logger.saveError(`AUTH-CONTROLLER-LOGIN: ${error}`);
			return res.status(500).json({ message: (error as Error).message });
		}
	}

	static logout() {}

	static async updateUser(req, res) {
		try {
			const user = await UserService.getUser(parseInt(req.params.id));

			if (!user) {
				return res.status(404).json({ message: 'No User Found' });
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

			if (req.body.remove_profile && user.profile) {
				await UploadService.removeUploadedFile(user.profile);
			}

			let profile_url = null;
			if (req.files && req.files['profile']) {
				const uploadedFile = req.files['profile'];
				const url = await UploadService.moveUploadFile(uploadedFile, {
					desitnation: 'users',
					maxSizeInBytes: 2 * 1024 * 1024,
				});
				profile_url = url;
			}

			const { name, gender, birth } = req.body;

			const updatedUser = await UserService.updateUser(parseInt(req.params.id), {
				name: name,
				gender: gender,
				birth: birth,
				profile: profile_url,
			});

			res.json(updatedUser.toJsonResponse());
		} catch (error) {
			Logger.saveError(`AUTH-CONTROLLER-DELETE: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async deleteUser(req, res) {
		try {
			const user = await UserService.getUser(req.params.id);
			if (!user) {
				return res.status(404).json({ message: 'No User Found' });
			}

			const deleted = await UserService.deleteUser(user.id);
			if (!deleted) {
				return res.status(500).json({ message: `Cannot delete ${user.name}` });
			}

			if (user.profile) {
				await UploadService.removeUploadedFile(user.profile);
			}

			return res.json({ message: `${user.name} is deleted` });
		} catch (error) {
			Logger.saveError(`AUTH-CONTROLLER-DELETE: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}
}

export default AuthController;
