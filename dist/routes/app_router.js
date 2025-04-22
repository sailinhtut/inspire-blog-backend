"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appRouter = (0, express_1.Router)();
appRouter.post('/send-email', async (req, res) => {
    try {
        res.json({ message: 'Email is sent!' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = appRouter;
