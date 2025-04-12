import { Request, Response, Router } from 'express';
import multerUpload from '../services/upload_service';
import { storageDownloadURL } from '../utils/path_resolver';
import { uniqueID } from '../utils/id_generator';
import multer from 'multer';
import { config } from 'dotenv';
import Logger from '../services/logging_service';

const appRouter = Router();

appRouter.post(
	'/upload',
	multerUpload({
		entries: [
			{
				fieldName: 'profile',
				savePath: 'profile',
			},
			{ fieldName: 'attachments', savePath: 'attachments' },
		],
	}).any(),
	(req: Request, res: Response) => {
		try {
			res.status(201).json({
				message: 'Files uploaded successfully',
				fileUrl: req.files
					? (req.files as Express.Multer.File[]).map((file) =>
							storageDownloadURL(file.fieldname, file.filename)
					  )
					: [],
			});
		} catch (error) {
			Logger.console(`Upload error: ${error}`);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
);

export default appRouter;
