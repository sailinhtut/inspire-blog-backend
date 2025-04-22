"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = __importDefault(require("../services/resources/comment_service"));
const logging_service_1 = __importDefault(require("../services/logging_service"));
const express_validator_1 = require("express-validator");
const validator_formatter_1 = require("../utils/validator_formatter");
class CommentController {
    static addValidator = [
        (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
        (0, express_validator_1.body)('post_id').isInt().withMessage('post_id must be an integer'),
        (0, express_validator_1.body)('user_id').isInt().withMessage('user_id must be an integer'),
        (0, express_validator_1.body)('parent_comment_id')
            .optional()
            .isInt()
            .withMessage('parent_comment_id must be an integer'),
    ];
    static async getComments(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            const comments = await comment_service_1.default.getCommentsByPost(postId);
            const data = comments.map((comment) => comment.toJsonResponse());
            res.json(data);
        }
        catch (error) {
            logging_service_1.default.saveError(`COMMENT-CONTROLLER-GET-COMMENTS: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async addComment(req, res) {
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
            const { user_id, post_id, content, parent_comment_id } = req.body;
            const comment = await comment_service_1.default.addComment({
                userId: user_id,
                postId: post_id,
                content: content,
                parentCommentId: parent_comment_id,
            });
            if (!comment) {
                return res.status(400).json({ message: 'Failed to create comment' });
            }
            res.status(201).json(comment.toJsonResponse());
        }
        catch (error) {
            logging_service_1.default.saveError(`COMMENT-CONTROLLER-ADD-COMMENT: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
    static async deleteComment(req, res) {
        try {
            const commentId = parseInt(req.params.commentId);
            const deleted = await comment_service_1.default.deleteComment(commentId);
            if (!deleted) {
                return res
                    .status(404)
                    .json({ message: 'Comment not found or failed to delete' });
            }
            res.json({ message: 'Comment deleted successfully' });
        }
        catch (error) {
            logging_service_1.default.saveError(`COMMENT-CONTROLLER-DELETE-COMMENT: ${error}`);
            res.status(500).json({ message: error.message });
        }
    }
}
exports.CommentController = CommentController;
