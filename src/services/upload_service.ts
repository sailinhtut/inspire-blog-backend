import multer, { Multer, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/config';
import { uniqueID } from '../utils/id_generator';
import Logger from './logging_service';

// Multer-File Object Schema
// {
//   fieldname: 'profile',
//   originalname: 'photo.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   destination: 'path/to/storage',
//   filename: 'my_custom_file.png', // 👈 Your custom name
//   path: 'path/to/storage/my_custom_file.png',
//   size: 12345
// }

interface UploadEntry {
	fieldName: string;
	savePath: string;
	filename?: string;
	allowedTypes?: string[];
}

export class MulterUploadError extends Error {
	statusCode: number;

	constructor(message: string, statusCode = 400) {
		super(message);
		this.name = 'MulterUploadError';
		this.statusCode = statusCode;
	}
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ensureDirectoryExists = (storagePath: string) => {
	if (!fs.existsSync(storagePath)) {
		fs.mkdirSync(storagePath, { recursive: true });
	}
};

export default function multerUpload({
	entries,
	maxSize,
}: {
	entries: UploadEntry[];
	maxSize?: number;
}): Multer {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const entry = entries.find((e) => e.fieldName === file.fieldname);
			if (entry) {
				const storagePath = path.join(config.rootDir, 'storage', entry.savePath);
				ensureDirectoryExists(storagePath);
				cb(null, storagePath);
			} else {
				const storagePath = path.join(config.rootDir, 'storage', 'uploads');
				ensureDirectoryExists(storagePath);
				cb(null, storagePath);
			}
		},
		filename: (req, file, cb) => {
			const entry = entries.find((e) => e.fieldName === file.fieldname);
			if (entry) {
				const origin = path.parse(file.originalname);
				const saveFilename = entry.filename ?? uniqueID(14);
				const name = `${saveFilename}${origin.ext}`;
				cb(null, name);
			} else {
				cb(
					null,
					`${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
				);
			}
		},
	});

	return multer({
		storage,
		fileFilter: (req, file, cb) => {
			const entry = entries.find((e) => e.fieldName === file.fieldname);
			if (!entry) return cb(null, true);

			// const maxSize = entry.maxSize || DEFAULT_MAX_SIZE;
			const allowedTypes = entry.allowedTypes || DEFAULT_ALLOWED_TYPES;

			if (!allowedTypes.includes(file.mimetype)) {
				const msg = `Invalid file type for ${
					file.fieldname
				}. Allowed types: ${allowedTypes.join(', ')}`;
				Logger.console(msg);
				return cb(new MulterUploadError(msg));
			}

			// if (file.size > maxSize) {
			// 	const msg = `File size exceeds limit for ${file.fieldname}. Max size: ${
			// 		maxSize / 1024 / 1024
			// 	}MB`;
			// 	logger.debug(msg);
			// 	return cb(new MulterUploadError(msg));
			// }
			cb(null, true);
		},
		limits: {
			fileSize: maxSize ?? DEFAULT_MAX_SIZE,
		},
	});
}

export async function rollbackMulterUploaded(files: Express.Multer.File[]) {
	files.forEach((file) => {
		if (fs.existsSync(file.path)) {
			Logger.console('Deleteing' + ' ' + file.path);
			fs.unlinkSync(file.path);
		}
	});
}
