import { Like } from 'typeorm';
import { Post, PostResponse, PostStatus } from '../../models/post';
import Logger from '../logging_service';
import { AppDataSource } from '../typeorm_service';

export const postRepo = AppDataSource.getRepository(Post);

class PostService {
	static async getPosts(): Promise<Post[]> {
		let posts = await postRepo.find();
		return posts;
	}

	static async getPagniatedPosts({ page, size }: { page: number; size: number }): Promise<any> {
		const [posts, total] = await postRepo.findAndCount({
			skip: (page - 1) * size,
			take: size,
		});

		const lastPage = Math.ceil(total / size);
		const nextPage = page < lastPage ? page + 1 : null;
		const data = posts.map((post) => post.toJsonResponse());

		return {
			data,
			currentPage: page,
			nextPage,
			lastPage,
			totalPage: lastPage,
			total,
			perPage: size,
		};
	}

	static async getPost(postId: number): Promise<Post | null> {
		let post = await postRepo.findOne({
			where: { id: postId },
		});
		return post;
	}

	static async addPost({
		title,
		content,
		status,
		tags,
		headerImage,
	}: {
		title: string;
		content: string;
		status: PostStatus;
		tags: string[];
		headerImage?: string;
	}): Promise<Post | null> {
		const newPost = postRepo.create({
			title,
			content,
			status,
			tags: tags,
			headerImage: headerImage,
		});
		Logger.console(`New Post Created - ${newPost.id}`);
		const savedPost = await postRepo.save(newPost);
		return savedPost;
	}

	static async updatePost(
		postId: number,
		{
			title,
			content,
			status,
			tags,
			headerImage,
		}: {
			title?: string;
			content?: string;
			status?: PostStatus;
			tags?: string[];
			headerImage?: string;
		}
	): Promise<Post | null> {
		const post = await postRepo.findOneBy({ id: postId });

		if (!post) {
			return null;
		}

		postRepo.merge(post, { title: title, content: content, status: status  , tags : tags, headerImage : headerImage  });
		const updatedPost = await postRepo.save(post);
		return updatedPost;
	}

	static async deletePost(postId: number): Promise<boolean> {
		const result = await postRepo.delete(postId);
		return result.affected !== 0;
	}

	static async searchPost(query: string): Promise<Post[]> {
		return await postRepo.find({
			where: [{ title: Like(`%${query}%`) }, { content: Like(`%${query}%`) }],
		});
	}

	static async searchPostsByTags(tags: string[]): Promise<Post[]> {
		if (tags.length === 0) return [];

		const queryBuilder = postRepo.createQueryBuilder('post');
		const conditions = tags.map((_, i) => `JSON_CONTAINS(post.tags, :tag${i})`).join(' OR ');
		const params = tags.reduce((acc, tag, i) => {
			acc[`tag${i}`] = JSON.stringify(tag); // each tag needs to be quoted JSON string
			return acc;
		}, {} as Record<string, any>);

		return await queryBuilder.where(conditions, params).getMany();
	}

	static async likePost(postId: number): Promise<Post | null> {
		const post = await postRepo.findOneBy({ id: postId });
		if (!post) return null;

		post.likes += 1;
		return await postRepo.save(post);
	}

	static async unlikePost(postId: number): Promise<Post | null> {
		const post = await postRepo.findOneBy({ id: postId });
		if (!post) return null;

		post.likes = Math.max(0, post.likes - 1);
		return await postRepo.save(post);
	}
}

export default PostService;
