"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_web_token_1 = __importDefault(require("../utils/json_web_token"));
const jsonwebtoken_1 = require("jsonwebtoken");
const user_service_1 = __importDefault(require("../services/resources/user_service"));
const authHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized Access' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = json_web_token_1.default.verifyToken(token);
        const user = await user_service_1.default.getUser(payload.id);
        if (!user) {
            res.status(404).json({ message: 'No User Found' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({ message: 'Expired Token' });
        }
        else if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid Token' });
        }
        res.status(500).json({ message: 'Authentication error', error: err.message });
    }
};
exports.default = authHandler;
