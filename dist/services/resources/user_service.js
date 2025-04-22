"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepo = void 0;
const user_1 = require("../../models/user");
const typeorm_service_1 = require("../typeorm_service");
exports.userRepo = typeorm_service_1.AppDataSource.getRepository(user_1.User);
class UserService {
    static async getUsers() {
        let users = await exports.userRepo.find();
        return users;
    }
    static async getPagniatedUsers({ page, size }) {
        const [users, total] = await exports.userRepo.findAndCount({
            skip: (page - 1) * size,
            take: size,
        });
        const lastPage = Math.ceil(total / size);
        const nextPage = page < lastPage ? page + 1 : null;
        const data = users.map((user) => user.toJsonResponse());
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
    static async getUser(userId) {
        let user = await exports.userRepo.findOne({
            where: { id: userId },
        });
        return user;
    }
    static async getUserByEmail(email) {
        let user = await exports.userRepo.findOne({
            where: { email: email },
        });
        return user;
    }
    static async addUser({ name, email, password, gender, birth, profile, }) {
        const newUser = exports.userRepo.create({
            name,
            email,
            password,
            gender,
            birth: birth,
            profile: profile,
        });
        const savedUser = await exports.userRepo.save(newUser);
        return savedUser;
    }
    static async updateUser(userId, { name, gender, birth, profile, }) {
        const user = await exports.userRepo.findOneBy({ id: userId });
        if (!user) {
            return null;
        }
        exports.userRepo.merge(user, {
            name: name,
            gender: gender,
            birth: birth,
            profile: profile,
        });
        const updatedPost = await exports.userRepo.save(user);
        return updatedPost;
    }
    static async deleteUser(userId) {
        const result = await exports.userRepo.delete(userId);
        return result.affected !== 0;
    }
}
exports.default = UserService;
