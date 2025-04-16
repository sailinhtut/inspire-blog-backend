import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { User } from './user';
import { Post } from './post';

export type CommentResponse = {
	id: number;
	content: string;
	created_at: Date;
	updated_at: Date;
	user_id: number;
	replies: CommentResponse[];
};

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text')
	content: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user.comments, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Post, (post) => post.comments, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'post_id' })
	post: Post;

	@ManyToOne(() => Comment, (comment) => comment.replies, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'parent_comment_id' })
	parentComment?: Comment;

	@OneToMany(() => Comment, (comment) => comment.parentComment)
	replies: Comment[];

	toJsonResponse(): CommentResponse {
		return {
			id: this.id,
			content: this.content,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
			user_id: this.user ? this.user.id : null,
			replies: this.replies?.length
				? this.replies.map((reply) => reply.toJsonResponse())
				: [],
		};
	}
}
