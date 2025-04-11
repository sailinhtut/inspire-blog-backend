import { Request, Response, Router } from 'express';
import multerUpload, { createDiskConfig } from '../service/upload_service';
import logger from '../util/logger';
import { storageDownloadURL } from '../util/path_resolver';
import { uniqueID } from '../util/id_generator';

const appRouter = Router();

appRouter.post(
	'/upload',
	multerUpload([
		{ fieldName: 'profile', savePath: 'profile', filename: uniqueID(14) },
		{ fieldName: 'attachments', savePath: 'attachments', filename: uniqueID(14) },
	]).any(),
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
			logger.error(`Upload error: ${error}`);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
);

export default appRouter;
