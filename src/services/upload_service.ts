import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/config';
import { uniqueID } from '../utils/id_generator';
import { formatBytes } from '../utils/byte_formatter';
import { deleteFileIfExists } from '../utils/file_operation';
import Logger from './logging_service';

export interface FileValidationRule {
	desitnation?: string; // e.g., posts
	filename?: string; // e.g., uniqueID(14)
	allowedMimeTypes?: string[]; // e.g., ['image/jpeg', 'image/jpg', 'image/png']
	maxSizeInBytes?: number; // e.g., 5 * 1024 * 1024 for 5MB
}

class UploadService {
	static async moveUploadFile(
		uploadedFile: any,
		validation: FileValidationRule = {}
	): Promise<string | null> {
		try {
			const defaultRule: FileValidationRule = {
				desitnation: 'upload',
				filename: uniqueID(14),
				allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
				maxSizeInBytes: 10 * 1024 * 1024,
			};

			const rule = {
				...defaultRule,
				...validation,
			};

			const uploadDir = path.join(config.publicFilesDir, rule.desitnation);
			const filename = `${uniqueID(14)}${path.extname(uploadedFile.name)}`;
			const targetPath = path.join(uploadDir, filename);

			if (!rule.allowedMimeTypes.includes(uploadedFile.mimetype)) {
				throw new Error(`Invalid file extension: ${uploadedFile.mimetype}`);
			}

			if (uploadedFile.size > rule.maxSizeInBytes) {
				throw new Error(`File size exceeds limit: ${formatBytes(uploadedFile.size)}`);
			}

			const targetDir = path.dirname(targetPath);
			await fs.mkdir(targetDir, { recursive: true });

			await uploadedFile.mv(targetPath);

			return path.join(rule.desitnation, filename);
		} catch (error) {
			throw new Error(`Upload failed: ${(error as Error).message}`);
		}
	}

	static async removeUploadedFile(relativePath) {
		try {
			deleteFileIfExists(config.publicFilesDir, relativePath);
		} catch (error) {
			throw new Error(`Remove failed: ${(error as Error).message}`);
		}
	}
}

export default UploadService;
