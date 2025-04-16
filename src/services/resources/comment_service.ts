import { AppDataSource } from '../typeorm_service';
import { Comment } from '../../models/comment';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import Logger from '../logging_service';

const commentRepo = AppDataSource.getRepository(Comment);
const userRepo = AppDataSource.getRepository(User);
const postRepo = AppDataSource.getRepository(Post);

class CommentService {
	static async getCommentsByPost(postId: number): Promise<Comment[]> {
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
		const filtered = comments.filter(
			(c) => !comments.some((parent) => parent.replies.some((r) => r.id === c.id))
		);

		return filtered;
	}

	static async getReplies(commentId: number): Promise<Comment[]> {
		const replies = await commentRepo.find({
			where: { parentComment: { id: commentId } },
			relations: ['user'],
			order: { createdAt: 'DESC' },
		});
		return replies;
	}
	static async addComment({
		userId,
		postId,
		content,
		parentCommentId,
	}: {
		userId: number;
		postId: number;
		content: string;
		parentCommentId?: number;
	}): Promise<Comment | null> {
		const user = await userRepo.findOneBy({ id: userId });
		const post = await postRepo.findOneBy({ id: postId });

		if (!user || !post) return null;

		let parentComment: Comment | null = null;
		if (parentCommentId) {
			parentComment = await commentRepo.findOneBy({ id: parentCommentId });
			if (!parentComment) return null;
		}

		const comment = commentRepo.create({ content, user, post, parentComment });
		return await commentRepo.save(comment);
	}

	static async deleteComment(commentId: number): Promise<boolean> {
		const result = await commentRepo.delete(commentId);
		return result.affected !== 0;
	}
}

export default CommentService;
