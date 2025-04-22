"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_1 = require("../models/post");
const post_service_1 = __importDefault(require("../services/resources/post_service"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
const express_validator_1 = require("express-validator");
const validator_formatter_1 = require("../utils/validator_formatter");
const upload_service_1 = __importDefault(require("../services/upload_service"));
class PostController {
    static addValidator = [
        (0, express_validator_1.body)('title')
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 255 })
            .withMessage('Title is too long'),
        (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
        (0, express_validator_1.body)('status')
            .isIn(Object.values(post_1.PostStatus))
            .withMessage('Status must be one of: publish, draft, archive'),
        (0, express_validator_1.body)('tags')
            .notEmpty()
            .withMessage('Tags is required')
            .customSanitizer((value) => {
            if (typeof value === 'string') {
                return [value];
            }
            return value;
        })
            .isArray({ min: 1 })
            .withMessage('Tags must be a non-empty array'),
        (0, express_validator_1.body)('tags.*').isString().withMessage('Each tag must be a string'),
    ];
    static updateValidator = [
        (0, express_validator_1.body)('title').optional().isLength({ max: 255 }).withMessage('Title is too long'),
        (0, express_validator_1.body)('content').optional(),
        (0, express_validator_1.body)('status')
            .optional()
            .isIn(Object.values(post_1.PostStatus))
            .withMessage('Status must be one of: publish, draft, archive'),
        (0, express_validator_1.body)('tags')
            .optional()
            .customSanitizer((value) => {
            if (typeof value === 'string') {
                return [value];
            }
            return value;
        })
            .isArray({ min: 1 })
            .withMessage('Tags must be a non-empty array'),
        (0, express_validator_1.body)('tags.*').isString().withMessage('Each tag must be a string'),
        (0, express_validator_1.body)('remove_header_image')
            .optional()
            .isBoolean()
            .withMessage('isActive must be a boolean (true or false)')
            .toBoolean(),
    ];
    static async getPosts(req, res) {
        try {
            if (req.query === undefined) {
                req.query = {};
            }
            if (req.query.search) {
                const foundPosts = await post_service_1.default.searchPost(req.query.search);
                const data = foundPosts.map((post) => post.toJsonResponse());
                return res.json(data);
            }
            if (req.query.tags) {
                const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
                const foundPosts = await post_service_1.default.searchPostsByTags(tags);
                const data = foundPosts.map((post) => post.toJsonResponse());
                return res.json(data);
            }
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;
            const posts = await post_service_1.default.getPagniatedPosts({ page: page, size: size });
            res.json(posts);
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-GET-POSTS: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async getPost(req, res) {
        try {
            const post = await post_service_1.default.getPost(parseInt(req.params.id));
            if (!post) {
                res.status(404).json({ message: 'No Post Found' });
            }
            res.json(post.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`PostController-GET POST: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async addPost(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Invalid Data Provided',
                    errors: (0, validator_formatter_1.formatValidationErrors)(errors.array()),
                });
            }
            let header_image_url = null;
            if (req.files && req.files['header_image']) {
                const uploadedFile = req.files['header_image'];
                const url = await upload_service_1.default.moveUploadFile(uploadedFile, {
                    desitnation: 'posts',
                    maxSizeInBytes: 2 * 1024 * 1024,
                });
                header_image_url = url;
            }
            const { title, content, status, tags } = req.body;
            const createdPost = await post_service_1.default.addPost({
                title: title,
                content: content,
                status: status,
                tags: tags,
                headerImage: header_image_url,
            });
            res.status(201).json(createdPost.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-ADD-POST: ${error}`);
            return PostController.errorResponse(req, res, 500, {
                message: error.message,
            });
        }
    }
    static async updatePost(req, res) {
        try {
            const post = await post_service_1.default.getPost(parseInt(req.params.id));
            if (!post) {
                return PostController.errorResponse(req, res, 404, {
                    message: 'Not Post Found',
                });
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
            let header_image_url = post.headerImage;
            if (req.body.remove_header_image && post.headerImage) {
                await upload_service_1.default.removeUploadedFile(post.headerImage);
                header_image_url = null;
            }
            if (req.files && req.files['header_image']) {
                const uploadedFile = req.files['header_image'];
                const url = await upload_service_1.default.moveUploadFile(uploadedFile, {
                    desitnation: 'posts',
                    maxSizeInBytes: 2 * 1024 * 1024,
                });
                header_image_url = url;
                // clear previous header image
                if (post.headerImage) {
                    await upload_service_1.default.removeUploadedFile(post.headerImage);
                }
            }
            const { title, content, status, tags } = req.body;
            const updatedPost = await post_service_1.default.updatePost(parseInt(req.params.id), {
                title: title,
                content: content,
                status: status,
                tags: tags,
                headerImage: header_image_url,
            });
            res.json(updatedPost.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-UPDATE-POST: ${error}`);
            return PostController.errorResponse(req, res, 500, {
                message: error.message,
            });
        }
    }
    static async deletePost(req, res) {
        try {
            const post = await post_service_1.default.getPost(parseInt(req.params.id));
            if (!post) {
                res.status(404).json({ message: 'No Post Found' });
            }
            const deleted = await post_service_1.default.deletePost(post.id);
            if (!deleted) {
                res.status(500).json({ message: `Cannot deleted` });
            }
            if (post.headerImage) {
                await upload_service_1.default.removeUploadedFile(post.headerImage);
            }
            res.json({ message: `${post.title} is deleted` });
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-DELETE-POST: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static errorResponse(req, res, statusCode, object) {
        return res.status(statusCode).json(object);
    }
    static async likePost(req, res) {
        try {
            const result = await post_service_1.default.likePost(req.params.id);
            if (!result) {
                return res.status(500).json({ message: 'Cannot like post' });
            }
            return res.json({ message: 'Post Updated Successfully' });
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-LIKE-POST: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async unlikePost(req, res) {
        try {
            const result = await post_service_1.default.unlikePost(req.params.id);
            if (!result) {
                return res.status(500).json({ message: 'Cannot unlike post' });
            }
            return res.json({ message: 'Post Updated Successfully' });
        }
        catch (error) {
            logging_service_1.default.saveError(`POST-CONTROLLER-UNLIKE-POST: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
}
exports.PostController = PostController;
