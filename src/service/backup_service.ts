import logger from '../util/logger';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { exec } from 'child_process';
import config from '../config/config';
import cron from 'node-cron';

export async function backupDatabase() {
	const backupDir = path.join(config.rootDir, 'backup/database');

	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	const sqlFile = path.join(backupDir, `backup.sql`);
	const zipFile = path.join(backupDir, `backup.zip`);

	const dumpCommand = `mysqldump -u ${config.db_user} ${
		config.db_password ? '-p ${config.db_password}' : ''
	} ${config.db_name} > "${sqlFile}"`;

	logger.debug('Starting MySQL database backup...');

	exec(dumpCommand, (error, stdout, stderr) => {
		if (error) {
			logger.error(`Backup error: ${error.message}`);
			return;
		}
		if (stderr) {
			logger.error(`Backup stderr: ${stderr}`);
		}

		logger.info(`Database backup saved: ${sqlFile}`);

		const output = fs.createWriteStream(zipFile);
		const archive = archiver('zip', {
			zlib: { level: 9 },
		});

		output.on('close', () => {
			logger.info(`Backup zipped: ${zipFile} (${archive.pointer()} bytes)`);
			// Optionally delete the .sql after zipping
			fs.unlinkSync(sqlFile);
			logger.debug(`Original SQL file deleted: ${sqlFile}`);
		});

		archive.on('error', (err) => {
			logger.error(`Archive error: ${err.message}`);
		});

		archive.pipe(output);
		archive.file(sqlFile, { name: `backup.sql` });
		archive.finalize();
	});
}

export async function backupStorage() {
	try {
		const backupDir = path.join(config.rootDir, 'backup/storage');

		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		const outputPath = path.join(backupDir, 'storage.zip');
		const output = fs.createWriteStream(outputPath);
		const archive = archiver('zip', {
			zlib: { level: 9 },
		});

		output.on('close', () => {
			logger.info(`Zipped ${archive.pointer()} total bytes`);
		});

		archive.on('error', (err) => {
			throw err;
		});

		archive.on('progress', (progress) => {
			logger.debug(
				`Zipping Progress: Entries Processed: ${progress.entries.processed}, Total Bytes: ${progress.fs.processedBytes}`
			);
		});

		archive.pipe(output);

		// Add the entire storage folder to the archive
		const storagePath = path.join(config.rootDir, 'storage');
		archive.directory(storagePath, false);

		archive.finalize();
	} catch (error) {
		logger.error(`Error while zipping storage folder: ${error.message}`);
	}
}

export default function scheduleTasks() {
	// backupDatabase(); // initial backup
	cron.schedule('*/10 * * * *', () => {
		backupDatabase();
	});

	// backupStorage(); // initial backup
	cron.schedule('*/10 * * * *', async () => {
		backupStorage();
	});
}
