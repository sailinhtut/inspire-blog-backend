import { Request, Response, Router } from 'express';
import { storageDownloadURL } from '../utils/path_resolver';
import { uniqueID } from '../utils/id_generator';
import multer from 'multer';
import Logger from '../services/logging_service';
import path from 'path';

import config from '../config/config';
import { z } from 'zod';
import fs from 'fs';
import { body, validationResult } from 'express-validator';

const appRouter = Router();


appRouter.post(
	'/upload',
	[
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Invalid email'),
		body('password')
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 characters long'),
		
	],
	async (req, res): Promise<any> => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		if (!req.files || !req.files['profile']) {
			return res.status(400).send('No file was uploaded.');
		}

		const uploadedFile = req.files['profile'];

		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
		if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
			return res.status(400).json({
				message: 'Invalid file type. Only JPEG, PNG, and WEBP are allowed.',
			});
		}

		// ✅ Validate file size (5MB max)
		const MAX_SIZE = 10 * 1024 * 1024;
		if (uploadedFile.size > MAX_SIZE) {
			return res.status(400).json({
				message: 'File is too large. Max size is 5MB.',
			});
		}

		try {
			const uploadDir = path.join(config.publicFilesDir, 'posts');
			const filename = `${uniqueID(14)}${path.extname(uploadedFile.name)}`;
			const targetPath = path.join(uploadDir, filename);
			fs.mkdirSync(uploadDir, { recursive: true });

			await uploadedFile.mv(targetPath);

			return res.send({
				message: 'File is uploaded',
				download_url: storageDownloadURL('posts', filename),
			});
		} catch (error) {
			const message = (error as Error).message;
			return res.status(500).json({
				message: 'Server Error',
				errors: message,
			});
		}
	}
);

export default appRouter;
