"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
const auth_handler_1 = __importDefault(require("../middlewares/auth_handler"));
const user_favourite_controller_1 = require("../controllers/user_favourite_controller");
const authRouter = (0, express_1.Router)();
authRouter.post('/auth/sign-up', auth_controller_1.default.registerValidator, auth_controller_1.default.register);
authRouter.post('/auth/sign-in', auth_controller_1.default.logInValidator, auth_controller_1.default.login);
authRouter.post('/auth/send-verification-email/:id', auth_controller_1.default.sendVerificationEmail);
authRouter.get('/auth/verify-email', auth_controller_1.default.verifyEmail);
authRouter.get('/users', auth_handler_1.default, auth_controller_1.default.getUsers);
authRouter.get('/users/:id', auth_handler_1.default, auth_controller_1.default.getUser);
authRouter.put('/users/:id', auth_handler_1.default, auth_controller_1.default.updateValidator, auth_controller_1.default.updateUser);
authRouter.delete('/users/:id', auth_handler_1.default, auth_controller_1.default.deleteUser);
// Favourite Posts
authRouter.get('/users/:id/favourites', auth_handler_1.default, user_favourite_controller_1.UserFavouriteController.getUserFavourites);
authRouter.post('/users/:id/favourites', auth_handler_1.default, user_favourite_controller_1.UserFavouriteController.addValidator, user_favourite_controller_1.UserFavouriteController.addFavourite);
authRouter.delete('/users/:id/favourites', auth_handler_1.default, user_favourite_controller_1.UserFavouriteController.removeValidator, user_favourite_controller_1.UserFavouriteController.removeFavourite);
exports.default = authRouter;
