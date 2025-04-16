import fs from 'fs';
import path from 'path';
export function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getDirectorySize(directoryPath) {
	let totalSize = 0;

	function calculateSize(currentPath) {
		const stats = fs.statSync(currentPath);

		if (stats.isFile()) {
			totalSize += stats.size;
		} else if (stats.isDirectory()) {
			const entries = fs.readdirSync(currentPath);
			for (const entry of entries) {
				calculateSize(path.join(currentPath, entry));
			}
		}
	}

	calculateSize(directoryPath);
	return totalSize;
}
