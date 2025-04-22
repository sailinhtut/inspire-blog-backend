"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const SECRET = config_1.default.jwt_secret; // Use environment variable in production
class JWT {
    static generateToken(payload, { expiresIn = '7d' }) {
        return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: expiresIn });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
}
exports.default = JWT;
