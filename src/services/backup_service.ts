import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { exec } from 'child_process';
import config from '../config/config';
import cron from 'node-cron';
import Logger from './logging_service';

export async function backupDatabase() {
	const backupDir = path.join(config.backupDir, 'database');

	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	const sqlFile = path.join(backupDir, `backup.sql`);
	const zipFile = path.join(backupDir, `backup.zip`);

	const dumpCommand = `mysqldump -u ${config.db_user} ${
		config.db_password ? '-p ${config.db_password}' : ''
	} ${config.db_name} > "${sqlFile}"`;

	Logger.console('Starting MySQL database backup...');

	exec(dumpCommand, (error, stdout, stderr) => {
		if (error) {
			Logger.saveError(`Backup error: ${error.message}`);
			return;
		}
		if (stderr) {
			Logger.saveError(`Backup stderr: ${stderr}`);
		}

		Logger.saveInfo(`Database backup saved: ${sqlFile}`);

		const output = fs.createWriteStream(zipFile);
		const archive = archiver('zip', {
			zlib: { level: 9 },
		});

		output.on('close', () => {
			Logger.saveInfo(`Backup zipped: ${zipFile} (${archive.pointer()} bytes)`);
			// Optionally delete the .sql after zipping
			fs.unlinkSync(sqlFile);
			Logger.console(`Original SQL file deleted: ${sqlFile}`);
		});

		archive.on('error', (err) => {
			Logger.saveError(`Archive error: ${err.message}`);
		});

		archive.pipe(output);
		archive.file(sqlFile, { name: `backup.sql` });
		archive.finalize();
	});
}

export async function backupStorage() {
	try {
		const backupDir = path.join(config.backupDir, 'disk');

		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		const outputPath = path.join(backupDir, 'disk.zip');
		const output = fs.createWriteStream(outputPath);
		const archive = archiver('zip', {
			zlib: { level: 9 },
		});

		output.on('close', () => {
			Logger.saveInfo(`Zipped ${archive.pointer()} total bytes`);
		});

		archive.on('error', (err) => {
			throw err;
		});

		archive.on('progress', (progress) => {
			Logger.console(
				`Zipping Progress: Entries Processed: ${progress.entries.processed}, Total Bytes: ${progress.fs.processedBytes}`
			);
		});

		archive.pipe(output);

		// Add the entire storage folder to the archive
		const storagePath = path.join(config.publicFilesDir);
		archive.directory(storagePath, false);

		archive.finalize();
	} catch (error) {
		Logger.saveError(`Error while zipping storage folder: ${error.message}`);
	}
}

export async function clearTemporaryDir() {
	try {
		fs.rmSync(config.tempDir, { recursive: true });
		fs.mkdirSync(config.tempDir, { recursive: true });
		Logger.console('Cleared Temporary Directory');
	} catch (error) {
		Logger.saveError(`Error while clearing temp folder: ${error.message}`);
	}
}

export default function scheduleTasks() {
	backupDatabase();
	cron.schedule('*/10 * * * *', () => {
		backupDatabase();
	});

	backupStorage();
	cron.schedule('*/10 * * * *', async () => {
		backupStorage();
	});

	cron.schedule('*/1 * * * *', async () => {
		clearTemporaryDir();
	});
}
