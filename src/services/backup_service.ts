import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { exec } from 'child_process';
import config from '../config/config';
import cron from 'node-cron';
import Logger from './logging_service';
import { formatBytes, getDirectorySize } from '../utils/byte_formatter';
import moment from 'moment';

export async function backupDatabase() {
	const rootBackupDir = path.join(config.backupDir, 'database');
	const schemaDir = path.join(rootBackupDir, 'schema');
	const dataDir = path.join(rootBackupDir, 'data');

	fs.mkdirSync(schemaDir, { recursive: true });
	fs.mkdirSync(dataDir, { recursive: true });

	const timestamp = moment().format('YYYY_MM_DD_hh_mm_A');
	const schemaSqlPath = path.join(schemaDir, 'schema.sql');
	const schemaZipPath = path.join(schemaDir, 'schema.zip');

	const dataSqlPath = path.join(dataDir, 'data.sql');
	const dataZipPath = path.join(dataDir, `${timestamp}.zip`);

	const dbUser = config.db_user;
	const dbPassword = config.db_password;
	const dbName = config.db_name;
	const passPart = dbPassword ? `-p${dbPassword}` : '';

	// Dump schema only
	const dumpSchemaCommand = `mysqldump -u ${dbUser} ${passPart} --no-data ${dbName} > "${schemaSqlPath}"`;

	// Dump data only
	const dumpDataCommand = `mysqldump -u ${dbUser} ${passPart} --no-create-info ${dbName} > "${dataSqlPath}"`;

	// Run schema dump
	exec(dumpSchemaCommand, (schemaErr) => {
		if (schemaErr) return Logger.saveError(`Schema Backup Error: ${schemaErr.message}`);

		zipFile(schemaSqlPath, schemaZipPath, () => {
			fs.unlinkSync(schemaSqlPath);
			Logger.saveInfo(`Schema Backup Saved: ${schemaZipPath}`);
		});
	});

	// Run data dump
	exec(dumpDataCommand, (dataErr) => {
		if (dataErr) return Logger.saveError(`Data Backup Error: ${dataErr.message}`);

		zipFile(dataSqlPath, dataZipPath, () => {
			fs.unlinkSync(dataSqlPath);
			Logger.saveInfo(`Data Backup Saved: ${dataZipPath}`);
		});
	});
}

function zipFile(inputPath: string, outputPath: string, onClose: () => void) {
	const output = fs.createWriteStream(outputPath);
	const archive = archiver('zip', { zlib: { level: 9 } });

	output.on('close', onClose);
	archive.on('error', (err) => Logger.saveError(`Archive Error: ${err.message}`));

	archive.pipe(output);
	archive.file(inputPath, { name: path.basename(inputPath) });
	archive.finalize();
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
			const size = formatBytes(archive.pointer());
			Logger.saveInfo(`Disk Back Up Saved: ${outputPath} (${size})`);
		});

		archive.on('error', (err) => {
			throw err;
		});

		archive.on('progress', (progress) => {
			Logger.console(
				`Zipping ${progress.entries.processed}/${progress.entries.total} (${formatBytes(
					progress.fs.processedBytes
				)})`
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
		const sizeInBytes = getDirectorySize(config.tempDir);
		fs.rmSync(config.tempDir, { recursive: true });
		fs.mkdirSync(config.tempDir, { recursive: true });
		Logger.console(`Cleared Temporary Directory (${formatBytes(sizeInBytes)})`);
	} catch (error) {
		Logger.saveError(`Error while clearing temp folder: ${error.message}`);
	}
}

export async function clearLogDir() {
	try {
		const sizeInBytes = getDirectorySize(config.logDir);
		fs.rmSync(config.logDir, { recursive: true });
		fs.mkdirSync(config.logDir, { recursive: true });
		Logger.console(`Cleared Log Directory (${formatBytes(sizeInBytes)})`);
	} catch (error) {
		Logger.saveError(`Error while clearing log folder: ${error.message}`);
	}
}

export default function scheduleTasks() {
	cron.schedule('*/10 * * * *', () => {
		backupDatabase();
	});

	cron.schedule('*/10 * * * *', async () => {
		backupStorage();
	});

	cron.schedule('*/10 * * * *', async () => {
		clearTemporaryDir();
	});

	cron.schedule('*/10 * * * *', async () => {
		clearLogDir();
	});
}
