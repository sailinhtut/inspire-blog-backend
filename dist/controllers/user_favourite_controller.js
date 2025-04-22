"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFavouriteController = void 0;
const logging_service_1 = __importDefault(require("../services/logging_service"));
const user_favourite_service_1 = __importDefault(require("../services/resources/user_favourite_service"));
const express_validator_1 = require("express-validator");
const validator_formatter_1 = require("../utils/validator_formatter");
const post_service_1 = __importDefault(require("../services/resources/post_service"));
class UserFavouriteController {
    static addValidator = [
        (0, express_validator_1.body)('post_id')
            .notEmpty()
            .withMessage('post_id is required')
            .isInt()
            .withMessage('Post ID must be an integer'),
    ];
    static removeValidator = [
        (0, express_validator_1.body)('post_id')
            .notEmpty()
            .withMessage('post_id is required')
            .isInt()
            .withMessage('Post ID must be an integer'),
    ];
    static async getUserFavourites(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const favourites = await user_favourite_service_1.default.getFavoritesByUser(userId);
            const data = favourites.map((post) => post.toJsonResponse());
            res.json(data);
        }
        catch (error) {
            logging_service_1.default.saveError(`USER-FAVOURITE-CONTROLLER-GET-USER-FAVOURITES: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async addFavourite(req, res) {
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
            const userId = req.params.id;
            const { post_id } = req.body;
            const post = await post_service_1.default.getPost(post_id);
            if (!post) {
                return res.status(404).json({ message: 'Post Not Found' });
            }
            const favourite = await user_favourite_service_1.default.addFavorite(userId, post_id);
            return res.status(201).json(favourite.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`USER-FAVOURITE-CONTROLLER-ADD-FAVOURITE: ${error}`);
            return res.status(500).json({ message: error.message });
        }
    }
    static async removeFavourite(req, res) {
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
            const userId = req.params.id;
            const { post_id } = req.body;
            const removed = await user_favourite_service_1.default.removeFavorite(parseInt(userId), parseInt(post_id));
            if (!removed) {
                return res.status(404).json({ message: 'Favourite not found' });
            }
            return res.json({ message: 'Removed from favourites' });
        }
        catch (error) {
            logging_service_1.default.saveError(`USER-FAVOURITE-CONTROLLER-REMOVE-FAVOURITE: ${error}`);
            return res.status(500).json({ message: error.message });
        }
    }
}
exports.UserFavouriteController = UserFavouriteController;
