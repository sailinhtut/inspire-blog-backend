import multer, { Multer, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/config';
import logger from '../util/logger';
import { uniqueID } from '../util/id_generator';


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
	maxSize?: number;
	allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ensureDirectoryExists = (storagePath: string) => {
	if (!fs.existsSync(storagePath)) {
		fs.mkdirSync(storagePath, { recursive: true });
	}
};

export function createDiskConfig(savePath: string, filename: string) {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const storagePath = path.join(config.rootDir, 'storage', savePath);
			ensureDirectoryExists(storagePath);

			cb(null, storagePath);
		},
		filename: (req, file, cb) => {
			const ext = path.extname(file.originalname); // safer
			const name = `${filename}-${file.originalname}.${ext}`;
			cb(null, name);
		},
		
	});
	return multer({ storage });
}

export default function multerUpload(entries: UploadEntry[]): Multer {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const entry = entries.find((e) => e.fieldName === file.fieldname);
			if (entry) {
				const storagePath = path.join(config.rootDir, 'storage', entry.savePath);
				ensureDirectoryExists(storagePath);

				// @ts-ignore
				if (!req.savedFilePaths) {
					// @ts-ignore
					req.savedFilePaths = [];
				}

				// @ts-ignore
				req.savedFilePaths.push(storagePath);

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

			// Default values
			const maxSize = entry.maxSize || DEFAULT_MAX_SIZE;
			const allowedTypes = entry.allowedTypes || DEFAULT_ALLOWED_TYPES;

			// Type check
			if (!allowedTypes.includes(file.mimetype)) {
				const msg = `Invalid file type for ${
					file.fieldname
				}. Allowed types: ${allowedTypes.join(', ')}`;
				logger.debug(msg);
				return cb(new Error(msg));
			}

			if (file.size > maxSize) {
				const msg = `File size exceeds limit for ${file.fieldname}. Max size: ${
					maxSize / 1024 / 1024
				}MB`;
				logger.debug(msg);
				return cb(new Error(msg));
			}
			cb(null, true);
		},
		limits: {
			fileSize: DEFAULT_MAX_SIZE,
		},
	});
}
