import path from 'path';
import fs from 'fs';
import config from '../config/config';
import logger from './logger';

export function deleteFileIfExists(...deletePath: string[]) {
	const filePath = path.join(config.storageDir, ...deletePath);
    
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
		logger.debug(`Deleted old file: ${filePath}`);
	}
}
