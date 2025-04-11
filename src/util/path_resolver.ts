import path from 'path';
import config from '../config/config';

export function storageDownloadURL(...relativePath: string[]) {
	const downloadPath = path.join('storage', ...relativePath);
	return config.host + '/' + downloadPath.replaceAll('\\', '/');
}
