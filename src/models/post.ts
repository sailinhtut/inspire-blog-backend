import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { storageDownloadURL } from '../utils/path_resolver';

export enum PostStatus {
	DRAFT = 'draft',
	PUBLISH = 'publish',
	ARCHIVE = 'archive',
}

export interface PostResponse {
	id: number;
	header_image: string | null;
	title: string;
	content: string;
	status: PostStatus;
	likes: number;
	tags: string[];
	created_at: Date;
	updated_at: Date;
}

@Entity()
export class Post {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', nullable: true })
	headerImage?: string;

	@Column()
	title: string;

	@Column({ type: 'text' })
	content: string;

	@Column({ type: 'int', default: 0 })
	likes: number;

	@Column({ type: 'simple-json', default: '[]' })
	tags: string[];

	@Column({
		type: 'enum',
		enum: PostStatus,
		default: PostStatus.PUBLISH,
	})
	status: PostStatus;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// @ManyToOne(() => Category, (category) => category.posts, {
	// 	onUpdate: 'CASCADE',
	// 	onDelete: 'SET NULL',
	// })
	// @JoinColumn({
	// 	name: 'category_id',
	// 	referencedColumnName: 'id',
	// })
	// category: Category;

	toJsonResponse(): PostResponse {
		return {
			id: this.id,
			header_image: this.headerImage ? storageDownloadURL(this.headerImage) : null,
			title: this.title,
			content: this.content,
			status: this.status,
			// category_id: this.category ? this.category.id : null,
			likes: this.likes,
			tags: this.tags,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
		};
	}
}
