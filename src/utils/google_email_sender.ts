import nodemailer from 'nodemailer';
import config from '../config/config';
import Logger from '../services/logging_service';

export async function sendSMTPEmail(options) {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: config.smpt_user,
				pass: config.smpt_password, // <- Use App Password here
			},
		});

		// const mailOptions = {
		// 	from: 'inspiredream.com',
		// 	to: 'sailinhtut76062@gmail.com',
		// 	subject: 'Test Email',
		// 	text: 'Hello from Inspire Dream Company',
		// };

		const info = await transporter.sendMail(options);
		Logger.console(`Email sent: ${JSON.stringify(info.response)}`);
		return info;
	} catch (error) {
		Logger.saveError(`Failed to send email: ${error.message}`);
		throw error;
	}
}
