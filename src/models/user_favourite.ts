import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from './user';
import { Post } from './post';

export interface UserFavoriteResponse {
	user_id: number;
	post_id: number;
}

@Entity('user_favorites')
export class UserFavorite {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Post, (post) => post, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'post_id' })
	post: Post;

	toJsonResponse(): UserFavoriteResponse {
		return {
			user_id: this.user.id,
			post_id: this.post.id,
		};
	}
}
