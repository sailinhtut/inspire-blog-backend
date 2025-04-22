"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const logging_service_1 = __importDefault(require("../services/logging_service"));
const validator_formatter_1 = require("../utils/validator_formatter");
const user_1 = require("../models/user");
const user_service_1 = __importStar(require("../services/resources/user_service"));
const upload_service_1 = __importDefault(require("../services/upload_service"));
const bcrypt = __importStar(require("bcrypt"));
const json_web_token_1 = __importDefault(require("../utils/json_web_token"));
const google_email_sender_1 = require("../utils/google_email_sender");
const config_1 = __importDefault(require("../config/config"));
class AuthController {
    static registerValidator = [
        (0, express_validator_1.body)('name')
            .notEmpty()
            .withMessage('Name is required')
            .isString()
            .withMessage('Name must be type of string')
            .isLength({ max: 100 })
            .withMessage('Name is too long'),
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid Email Address'),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8 })
            .withMessage('Password must be greater than 8 letters'),
        (0, express_validator_1.body)('gender').notEmpty().withMessage('Gender is required').isIn(Object.values(user_1.Gender)),
        (0, express_validator_1.body)('birth')
            .optional()
            .isISO8601()
            .withMessage('Birth must be a valid ISO 8601 date')
            .toDate(),
    ];
    static logInValidator = [
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid Email Address'),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8 })
            .withMessage('Password must be greater than 8 letters'),
    ];
    static updateValidator = [
        (0, express_validator_1.body)('name')
            .optional()
            .isString()
            .withMessage('Name must be type of string')
            .isLength({ max: 100 })
            .withMessage('Name is too long'),
        (0, express_validator_1.body)('gender').optional().isIn(Object.values(user_1.Gender)),
        (0, express_validator_1.body)('birth')
            .optional()
            .isISO8601()
            .withMessage('Birth must be a valid ISO 8601 date')
            .toDate(),
    ];
    static async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;
            const users = await user_service_1.default.getPagniatedUsers({ page: page, size: size });
            res.json(users);
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-GET-USERS: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async getUser(req, res) {
        try {
            return res.json({ message: 'Get User', data: req.user.toJsonResponse() });
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-GET-USER: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Invalid Data Provided',
                    errors: (0, validator_formatter_1.formatValidationErrors)(errors.array()),
                });
            }
            if (req.body === undefined) {
                req.body = {};
            }
            let profile_url = null;
            if (req.files && req.files['profile']) {
                const uploadedFile = req.files['profile'];
                const url = await upload_service_1.default.moveUploadFile(uploadedFile, {
                    desitnation: 'users',
                    maxSizeInBytes: 2 * 1024 * 1024,
                });
                profile_url = url;
            }
            const { name, email, password, gender, brith } = req.body;
            const hashPassword = await bcrypt.hash(password, 10);
            const createdUser = await user_service_1.default.addUser({
                name: name,
                email: email,
                password: hashPassword,
                gender: gender,
                birth: brith,
                profile: profile_url,
            });
            res.status(201).json(createdUser.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-REGISTER: ${error}`);
            return res.status(500).json({ message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Invalid Data Provided',
                    errors: (0, validator_formatter_1.formatValidationErrors)(errors.array()),
                });
            }
            if (req.body === undefined) {
                req.body = {};
            }
            const { email, password } = req.body;
            const user = await user_service_1.default.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'No User Found' });
            }
            const hashPassword = user.password;
            const correctPassword = await bcrypt.compare(password, hashPassword);
            if (!correctPassword) {
                return res.status(400).json({ message: 'Wrong Password' });
            }
            const apiToken = json_web_token_1.default.generateToken({ id: user.id, email: user.email }, { expiresIn: '7d' });
            res.json({
                messsage: 'Logged In Successfully',
                token: apiToken,
                user: user.toJsonResponse(),
            });
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-LOGIN: ${error}`);
            return res.status(500).json({ message: error.message });
        }
    }
    static logout() { }
    static async updateUser(req, res) {
        try {
            const user = await user_service_1.default.getUser(parseInt(req.params.id));
            if (!user) {
                return res.status(404).json({ message: 'No User Found' });
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Invalid Data Provided',
                    errors: (0, validator_formatter_1.formatValidationErrors)(errors.array()),
                });
            }
            if (req.body === undefined) {
                req.body = {};
            }
            let profile_url = user.profile;
            if (req.body.remove_profile && user.profile) {
                await upload_service_1.default.removeUploadedFile(user.profile);
                profile_url = null;
            }
            if (req.files && req.files['profile']) {
                const uploadedFile = req.files['profile'];
                const url = await upload_service_1.default.moveUploadFile(uploadedFile, {
                    desitnation: 'users',
                    maxSizeInBytes: 2 * 1024 * 1024,
                });
                profile_url = url;
                // remove previous profile image
                if (user.profile) {
                    await upload_service_1.default.removeUploadedFile(user.profile);
                }
            }
            const { name, gender, birth } = req.body;
            const updatedUser = await user_service_1.default.updateUser(parseInt(req.params.id), {
                name: name,
                gender: gender,
                birth: birth,
                profile: profile_url,
            });
            res.json(updatedUser.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-UPDATE: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async deleteUser(req, res) {
        try {
            const user = await user_service_1.default.getUser(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'No User Found' });
            }
            const deleted = await user_service_1.default.deleteUser(user.id);
            if (!deleted) {
                return res.status(500).json({ message: `Cannot delete ${user.name}` });
            }
            if (user.profile) {
                await upload_service_1.default.removeUploadedFile(user.profile);
            }
            return res.json({ message: `${user.name} is deleted` });
        }
        catch (error) {
            logging_service_1.default.saveError(`AUTH-CONTROLLER-DELETE: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async sendVerificationEmail(req, res) {
        try {
            const userId = req.params.id;
            const user = await user_service_1.default.getUser(userId);
            if (!user) {
                return res.status(404).json({ message: 'No User Found' });
            }
            const token = json_web_token_1.default.generateToken({ id: user.id }, { expiresIn: '10m' });
            const verificationURL = `${config_1.default.host}/api/auth/verify-email?token=${token}`;
            const mailOptions = {
                from: 'no-reply@inspiredream.com',
                to: user.email,
                subject: 'Verify your email',
                html: `
					<h2>Hello, ${user.name}!</h2>
					<p>Click the link below to verify your email address. This link expires in 10 minutes.</p>
					<a href="${verificationURL}">Verify Email</a>
				`,
            };
            const info = await (0, google_email_sender_1.sendSMTPEmail)(mailOptions);
            console.log('Verification email sent:', info.response);
            return res.json({ message: 'Verfication Email Sent' });
        }
        catch (error) {
            console.error('Failed to send email:', error.message);
            throw error;
        }
    }
    static async verifyEmail(req, res) {
        const token = req.query.token;
        try {
            const payload = json_web_token_1.default.verifyToken(token);
            const user = await user_service_1.userRepo.findOneBy({ id: payload.id });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.isEmailVerified = new Date();
            await user_service_1.userRepo.save(user);
            return res.json({ message: 'Email Verified Successfully' });
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
    }
}
exports.default = AuthController;
