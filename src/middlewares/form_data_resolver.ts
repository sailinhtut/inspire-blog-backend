import { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import config from '../config/config';

const formDataResolver = fileUpload({
	useTempFiles: true,
	tempFileDir: path.join(config.tempDir), // Use OS temp dir or Project-Based temp dir
});

export default formDataResolver;
