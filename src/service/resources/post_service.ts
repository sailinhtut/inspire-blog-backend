import { Post, PostResponse, PostStatus } from '../../model/post';
import { postRepo } from '../../controller/post_controller';
import { categoryRepo } from '../../controller/category_controller';
import logger from '../../util/logger';

class PostService {
	static async getPosts(): Promise<Post[]> {
		let posts = await postRepo.find({ relations: ['category'] });
		return posts;
	}

	static async getPagniatedPosts({ page, size }: { page: number; size: number }): Promise<any> {
		const [posts, total] = await postRepo.findAndCount({
			skip: (page - 1) * size,
			take: size,
			relations: ['category'],
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
			relations: ['category'],
		});
		return post;
	}

	static async addPost({
		title,
		content,
		status,
		category_id,
		tags,
		headerImage,
	}: {
		title: string;
		content: string;
		status: PostStatus;
		category_id: number;
		tags: string[];
		headerImage?: string;
	}): Promise<Post | null> {
		const category = await categoryRepo.findOne({ where: { id: category_id } });

		const newPost = postRepo.create({
			title,
			content,
			status,
			category: category,
			tags: tags,
			headerImage: headerImage,
		});
		logger.debug(`New Post Created - ${newPost.id}`);
		const savedPost = await postRepo.save(newPost);
		return savedPost;
	}

	static async updatePost(
		postId: number,
		{
			title,
			content,
			status,
			category_id,
			tags,
			headerImage,
		}: {
			title?: string;
			content?: string;
			status?: PostStatus;
			category_id?: number;
			tags?: string[];
			headerImage?: string;
		}
	): Promise<Post | null> {
		const post = await postRepo.findOneBy({ id: postId });

		if (!post) {
			return null;
		}

		if (category_id) {
			const category = await categoryRepo.findOneBy({ id: category_id });
			post.category = category;
		}

		postRepo.merge(post, { title, content, status, tags, headerImage });
		const updatedPost = await postRepo.save(post);
		return updatedPost;
	}

	static async deletePost(postId: number): Promise<boolean> {
		const result = await postRepo.delete(postId);
		return result.affected !== 0;
	}
}

export default PostService;
