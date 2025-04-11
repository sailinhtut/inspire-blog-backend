import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Post } from './post';

export interface CategoryResponse {
	id: number;
	name: string;
	description?: string;
	created_at: Date;
	updated_at: Date;
}

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Post, (post) => post.category)
	posts: Post[];

	toJsonResponse(): CategoryResponse {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
		};
	}
}
