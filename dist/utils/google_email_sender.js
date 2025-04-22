"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMTPEmail = sendSMTPEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
async function sendSMTPEmail(options) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: config_1.default.smpt_user,
                pass: config_1.default.smpt_password, // <- Use App Password here
            },
        });
        // const mailOptions = {
        // 	from: 'inspiredream.com',
        // 	to: 'sailinhtut76062@gmail.com',
        // 	subject: 'Test Email',
        // 	text: 'Hello from Inspire Dream Company',
        // };
        const info = await transporter.sendMail(options);
        logging_service_1.default.console(`Email sent: ${JSON.stringify(info.response)}`);
        return info;
    }
    catch (error) {
        logging_service_1.default.saveError(`Failed to send email: ${error.message}`);
        throw error;
    }
}
