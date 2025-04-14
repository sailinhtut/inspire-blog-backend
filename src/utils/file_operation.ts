import path from 'path';
import fs from 'fs';
import config from '../config/config';
import Logger from '../services/logging_service';

export function deleteFileIfExists(...deletePath: string[]) {
	try {
		const filePath = path.join(...deletePath);
		Logger.console(filePath);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			Logger.console(`Deleted old file: ${filePath}`);
		}
	} catch (error) {
		throw new Error(`Delete Failed: ${(error as Error).message}`);
	}
}
