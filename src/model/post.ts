import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import 'reflect-metadata';

@Entity()
export class Post {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column('text')
	content: string;

	@CreateDateColumn()
	createdAt: Date;
}
