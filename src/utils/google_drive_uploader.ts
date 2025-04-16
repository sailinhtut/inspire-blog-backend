import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import config from '../config/config';
import { JWT } from 'google-auth-library';
import Logger from '../services/logging_service';
import { zipFile, zipFolder } from './zipper';
import { clearTemporaryDir } from '../services/backup_service';
import moment from 'moment';

const KEYFILEPATH = path.join(
	config.privateFilesDir,
	'service_accounts',
	'inspire-dream-23e4ff5f1bf6.json'
);

const FOLDER_ID = '1gYkkYGtAhgF49ArxkRhMTluOHnwtGPrZ';

async function uploadFileToGoogleDrive(filePath: string) {
	const auth = new google.auth.GoogleAuth({
		keyFile: KEYFILEPATH,
		scopes: ['https://www.googleapis.com/auth/drive.file'],
	});

	const authClient = (await auth.getClient()) as JWT;
	const driveService = google.drive({ version: 'v3', auth: authClient });

	const fileName = path.basename(filePath);
	const mimeType = mime.lookup(filePath) || 'application/octet-stream';

	const fileMetadata = {
		name: fileName,
		parents: [FOLDER_ID],
	};

	const media = {
		mimeType: mimeType,
		body: fs.createReadStream(filePath),
	};

	const fileSize = fs.statSync(filePath).size;

	try {
		const res = await driveService.files.create(
			{
				requestBody: fileMetadata,
				media: media,
				fields: 'id, name',
			},
			{
				onUploadProgress: (event) => {
					const progress = (event.bytesRead / fileSize) * 100;
					Logger.console(`Uploaded ${progress.toFixed(2)}%`);
				},
			}
		);
		Logger.console(`✅ Uploaded: ${res.data.name} (ID: ${res.data.id})`);
	} catch (error) {
		Logger.console(`Error uploading file: ${error}`);
	}
}

// For `npm run upload-backup-data`
export async function uploadBackUpToGoogleDrive() {
	const googleDriveBackUpFilename = moment().format('YYYY_MM_DD_hh_mm_A') + '.zip';
	zipFolder(
		config.backupDir,
		path.join(config.tempDir, googleDriveBackUpFilename),
		async (backupZipPath) => {
            Logger.console('Staring Google Drive Upload');
			await uploadFileToGoogleDrive(backupZipPath);
			await clearTemporaryDir();
		}
	);
}

