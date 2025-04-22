"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseErrorHandlerMiddleware = (err, req, res, next) => {
    res.status(500).json({ message: 'Server Error', error: err.message });
};
exports.default = responseErrorHandlerMiddleware;
