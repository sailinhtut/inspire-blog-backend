"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepo = void 0;
const typeorm_1 = require("typeorm");
const post_1 = require("../../models/post");
const logging_service_1 = __importDefault(require("../logging_service"));
const typeorm_service_1 = require("../typeorm_service");
exports.postRepo = typeorm_service_1.AppDataSource.getRepository(post_1.Post);
class PostService {
    static async getPosts() {
        let posts = await exports.postRepo.find();
        return posts;
    }
    static async getPagniatedPosts({ page, size }) {
        const [posts, total] = await exports.postRepo.findAndCount({
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
    static async getPost(postId) {
        let post = await exports.postRepo.findOne({
            where: { id: postId },
        });
        return post;
    }
    static async addPost({ title, content, status, tags, headerImage, }) {
        const newPost = exports.postRepo.create({
            title,
            content,
            status,
            tags: tags,
            headerImage: headerImage,
        });
        logging_service_1.default.console(`New Post Created - ${newPost.id}`);
        const savedPost = await exports.postRepo.save(newPost);
        return savedPost;
    }
    static async updatePost(postId, { title, content, status, tags, headerImage, }) {
        const post = await exports.postRepo.findOneBy({ id: postId });
        if (!post) {
            return null;
        }
        exports.postRepo.merge(post, { title: title, content: content, status: status, tags: tags, headerImage: headerImage });
        const updatedPost = await exports.postRepo.save(post);
        return updatedPost;
    }
    static async deletePost(postId) {
        const result = await exports.postRepo.delete(postId);
        return result.affected !== 0;
    }
    static async searchPost(query) {
        return await exports.postRepo.find({
            where: [{ title: (0, typeorm_1.Like)(`%${query}%`) }, { content: (0, typeorm_1.Like)(`%${query}%`) }],
        });
    }
    static async searchPostsByTags(tags) {
        if (tags.length === 0)
            return [];
        const queryBuilder = exports.postRepo.createQueryBuilder('post');
        const conditions = tags.map((_, i) => `JSON_CONTAINS(post.tags, :tag${i})`).join(' OR ');
        const params = tags.reduce((acc, tag, i) => {
            acc[`tag${i}`] = JSON.stringify(tag); // each tag needs to be quoted JSON string
            return acc;
        }, {});
        return await queryBuilder.where(conditions, params).getMany();
    }
    static async likePost(postId) {
        const post = await exports.postRepo.findOneBy({ id: postId });
        if (!post)
            return null;
        post.likes += 1;
        return await exports.postRepo.save(post);
    }
    static async unlikePost(postId) {
        const post = await exports.postRepo.findOneBy({ id: postId });
        if (!post)
            return null;
        post.likes = Math.max(0, post.likes - 1);
        return await exports.postRepo.save(post);
    }
}
exports.default = PostService;
