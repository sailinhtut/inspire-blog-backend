import { Request, Response, Router } from 'express';
import { storageDownloadURL } from '../utils/path_resolver';
import { uniqueID } from '../utils/id_generator';
import multer from 'multer';
import Logger from '../services/logging_service';
import path from 'path';

import config from '../config/config';
import { z } from 'zod';
import fs from 'fs';
import { body, validationResult } from 'express-validator';

import { sendSMTPEmail } from '../utils/google_email_sender';

const appRouter = Router();

appRouter.post('/send-email', async (req, res) => {
	try {
		
		res.json({ message: 'Email is sent!' });
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
});



export default appRouter;
