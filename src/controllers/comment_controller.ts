import { Request, Response } from 'express';
import CommentService from '../services/resources/comment_service';
import Logger from '../services/logging_service';
import { body, validationResult } from 'express-validator';
import { formatValidationErrors } from '../utils/validator_formatter';

export class CommentController {
	static addValidator = [
		body('content').notEmpty().withMessage('Content is required'),
		body('post_id').isInt().withMessage('post_id must be an integer'),
		body('user_id').isInt().withMessage('user_id must be an integer'),
		body('parent_comment_id')
			.optional()
			.isInt()
			.withMessage('parent_comment_id must be an integer'),
	];

	static async getComments(req: Request, res: Response) {
		try {
			const postId = parseInt(req.params.postId);
			const comments = await CommentService.getCommentsByPost(postId);
			const data = comments.map((comment) => comment.toJsonResponse());
			res.json(data);
		} catch (error) {
			Logger.saveError(`COMMENT-CONTROLLER-GET-COMMENTS: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async addComment(req: Request, res) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Invalid Data Provided',
					errors: formatValidationErrors(errors.array()),
				});
			}
			if (req.body === undefined) {
				req.body = {};
			}

			const { user_id, post_id, content, parent_comment_id } = req.body;

			const comment = await CommentService.addComment({
				userId: user_id,
				postId: post_id,
				content: content,
				parentCommentId: parent_comment_id,
			});

			if (!comment) {
				return res.status(400).json({ message: 'Failed to create comment' });
			}

			res.status(201).json(comment.toJsonResponse());
		} catch (error) {
			Logger.saveError(`COMMENT-CONTROLLER-ADD-COMMENT: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}

	static async deleteComment(req: Request, res) {
		try {
			const commentId = parseInt(req.params.commentId);
			const deleted = await CommentService.deleteComment(commentId);

			if (!deleted) {
				return res
					.status(404)
					.json({ message: 'Comment not found or failed to delete' });
			}

			res.json({ message: 'Comment deleted successfully' });
		} catch (error) {
			Logger.saveError(`COMMENT-CONTROLLER-DELETE-COMMENT: ${error}`);
			res.status(500).json({ message: (error as Error).message });
		}
	}
}
