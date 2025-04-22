import path from 'path';
import fs from 'fs';
import unzipper from 'unzipper';
import { exec } from 'child_process';
import config from '../config/config';
import Logger from '../services/logging_service';

export async function restoreDatabase(schemaZipPath: string, dataZipPath: string) {
	const tempDir = path.join(config.tempDir, 'database_restore');
	fs.mkdirSync(tempDir, { recursive: true });

	const schemaSQL = path.join(tempDir, 'schema.sql');
	const dataSQL = path.join(tempDir, 'data.sql');

	try {
		await unzip(schemaZipPath, schemaSQL);
		Logger.console('Schema SQL extracted.');

		await unzip(dataZipPath, dataSQL);
		Logger.console('Data SQL extracted.');

		await execPromise(getMysqlCommand(schemaSQL));
		Logger.console('Schema restored successfully.');

		await execPromise(getMysqlCommand(dataSQL));
		Logger.console('Data restored successfully.');

		fs.rmSync(schemaSQL, { recursive: true });
		fs.rmSync(dataSQL, { recursive: true });
		fs.rmSync(tempDir, { recursive: true });
	} catch (error) {
		Logger.saveError(`Restore error: ${error.message}`);
	}
}

function unzip(zipPath: string, outputFilePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const zipStream = fs.createReadStream(zipPath).pipe(unzipper.ParseOne());
		const outStream = fs.createWriteStream(outputFilePath);

		zipStream.on('error', reject);
		outStream.on('finish', resolve);
		zipStream.pipe(outStream);
	});
}

function getMysqlCommand(sqlPath: string): string {
	const dbUser = config.db_user;
	const dbPassword = config.db_password;
	const dbName = config.db_name;
	const passPart = dbPassword ? `-p${dbPassword}` : '';

	return `mysql -u ${dbUser} ${passPart} ${dbName} < "${sqlPath}"`;
}

function execPromise(cmd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			if (err) return reject(err);
			if (stderr) Logger.console(`Standard Error: ${stderr}`);
			resolve();
		});
	});
}

const schemaZipPath = path.join(config.backupDir, 'database', 'schema', 'schema.zip');
const dataZipPath = path.join(config.backupDir, 'database', 'data', '2025_04_16_08_50_PM.zip');

restoreDatabase(schemaZipPath, dataZipPath);
