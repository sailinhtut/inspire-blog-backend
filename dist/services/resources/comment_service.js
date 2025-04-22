"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_service_1 = require("../typeorm_service");
const comment_1 = require("../../models/comment");
const user_1 = require("../../models/user");
const post_1 = require("../../models/post");
const commentRepo = typeorm_service_1.AppDataSource.getRepository(comment_1.Comment);
const userRepo = typeorm_service_1.AppDataSource.getRepository(user_1.User);
const postRepo = typeorm_service_1.AppDataSource.getRepository(post_1.Post);
class CommentService {
    static async getCommentsByPost(postId) {
        const comments = await commentRepo.find({
            where: {
                post: { id: postId },
                parentComment: null,
            },
            relations: ['user', 'replies', 'replies.user'],
            order: {
                createdAt: 'DESC',
            },
        });
        const filtered = comments.filter((c) => !comments.some((parent) => parent.replies.some((r) => r.id === c.id)));
        return filtered;
    }
    static async getReplies(commentId) {
        const replies = await commentRepo.find({
            where: { parentComment: { id: commentId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return replies;
    }
    static async addComment({ userId, postId, content, parentCommentId, }) {
        const user = await userRepo.findOneBy({ id: userId });
        const post = await postRepo.findOneBy({ id: postId });
        if (!user || !post)
            return null;
        let parentComment = null;
        if (parentCommentId) {
            parentComment = await commentRepo.findOneBy({ id: parentCommentId });
            if (!parentComment)
                return null;
        }
        const comment = commentRepo.create({ content, user, post, parentComment });
        return await commentRepo.save(comment);
    }
    static async deleteComment(commentId) {
        const result = await commentRepo.delete(commentId);
        return result.affected !== 0;
    }
}
exports.default = CommentService;
