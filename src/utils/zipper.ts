import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import Logger from '../services/logging_service';

export function zipFile(inputPath: string, outputPath: string, onClose: (path: string) => void) {
	const output = fs.createWriteStream(outputPath);
	const archive = archiver('zip', { zlib: { level: 9 } });

	output.on('close', () => onClose(outputPath));
	archive.on('error', (err) => Logger.saveError(`Archive Error: ${err.message}`));

	archive.pipe(output);
	archive.file(inputPath, { name: path.basename(inputPath) });

	archive.on('entry', () => archive.finalize());
}

// Zip a folder with progress and entry-based finalize
export function zipFolder(
	inputFolderPath: string,
	outputPath: string,
	onClose: (path: string) => void
) {
	const output = fs.createWriteStream(outputPath);
	const archive = archiver('zip', { zlib: { level: 9 } });

	output.on('close', () => onClose(outputPath));
	archive.on('error', (err) => Logger.saveError(`Archive Error: ${err.message}`));

	archive.pipe(output);
	archive.directory(inputFolderPath, false);

	let finalized = false;
	archive.on('entry', () => {
		if (!finalized) {
			finalized = true;
			archive.finalize();
		}
	});
}
