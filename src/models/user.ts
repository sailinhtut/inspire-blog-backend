import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Post } from './post';
import { storageDownloadURL } from '../utils/path_resolver';
import { Comment } from './comment';


export enum Gender {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other',
}

export interface UserResponse {
	id: number;
	name: string;
	email: string;
	password: string;
	gender: Gender;
	profile?: string;
	isEmailVerified?: Date;
	birth?: Date;
	created_at: Date;
	updated_at: Date;
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 255 })
	name: string;

	@Column({ type: 'varchar', unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: Gender, default: Gender.MALE })
	gender: Gender;

	@Column({ type: 'varchar', nullable: true })
	profile?: string;

	@Column({ type: 'datetime', nullable: true })
	birth?: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'datetime', nullable: true })
	isEmailVerified?: Date;

	@OneToMany(() => Post, (post) => post.user)
	posts: Post[];

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];


	toJsonResponse(): UserResponse {
		return {
			id: this.id,
			name: this.name,
			email: this.email,
			password: this.password,
			gender: this.gender,
			profile: this.profile ? storageDownloadURL(this.profile) : null,
			isEmailVerified: this.isEmailVerified,
			birth: this.birth,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
		};
	}
}
