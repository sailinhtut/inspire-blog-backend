import path from 'path';
import fs from 'fs';
import config from '../config/config';
import Logger from '../services/logging_service';

export function deleteFileIfExists(...deletePath: string[]) {
	const filePath = path.join(config.storageDir, ...deletePath);

	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
		Logger.console(`Deleted old file: ${filePath}`);
	}
}
