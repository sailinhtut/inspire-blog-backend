import { AppDataSource } from '../typeorm_service';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import Logger from '../logging_service';
import { UserFavorite } from '../../models/user_favourite';

const userFavoriteRepo = AppDataSource.getRepository(UserFavorite);
const userRepo = AppDataSource.getRepository(User);
const postRepo = AppDataSource.getRepository(Post);

class UserFavoriteService {
	static async getFavoritesByUser(userId: number): Promise<Post[]> {
		const favorites = await userFavoriteRepo.find({
			where: { user: { id: userId } },
			relations: ['post'],
		});
		return favorites.map((fav) => fav.post);
	}

	static async addFavorite(userId: number, postId: number): Promise<UserFavorite | null> {
		const user = await userRepo.findOneBy({ id: userId });
		const post = await postRepo.findOneBy({ id: postId });

		if (!user || !post) {
			return null;
		}

		const alreadyFav = await userFavoriteRepo.findOne({
			where: {
				user: { id: userId },
				post: { id: postId },
			},
		});

		if (alreadyFav) {
			throw Error('Post is already in favourites');
		}

		const fav = userFavoriteRepo.create({ user, post });
		return await userFavoriteRepo.save(fav);
	}

	static async removeFavorite(userId: number, postId: number): Promise<boolean> {
		const result = await userFavoriteRepo.delete({
			user: { id: userId },
			post: { id: postId },
		});
		return result.affected !== 0;
	}
}

export default UserFavoriteService;
