"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_service_1 = require("../typeorm_service");
const post_1 = require("../../models/post");
const user_1 = require("../../models/user");
const user_favourite_1 = require("../../models/user_favourite");
const userFavoriteRepo = typeorm_service_1.AppDataSource.getRepository(user_favourite_1.UserFavorite);
const userRepo = typeorm_service_1.AppDataSource.getRepository(user_1.User);
const postRepo = typeorm_service_1.AppDataSource.getRepository(post_1.Post);
class UserFavoriteService {
    static async getFavoritesByUser(userId) {
        const favorites = await userFavoriteRepo.find({
            where: { user: { id: userId } },
            relations: ['post'],
        });
        return favorites.map((fav) => fav.post);
    }
    static async addFavorite(userId, postId) {
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
    static async removeFavorite(userId, postId) {
        const result = await userFavoriteRepo.delete({
            user: { id: userId },
            post: { id: postId },
        });
        return result.affected !== 0;
    }
}
exports.default = UserFavoriteService;
