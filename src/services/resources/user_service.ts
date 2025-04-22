import { Gender, User } from '../../models/user';
import { AppDataSource } from '../typeorm_service';

export const userRepo = AppDataSource.getRepository(User);

class UserService {
	static async getUsers(): Promise<User[]> {
		let users = await userRepo.find();
		return users;
	}

	static async getPagniatedUsers({ page, size }: { page: number; size: number }): Promise<any> {
		const [users, total] = await userRepo.findAndCount({
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

	static async getUser(userId: number): Promise<User | null> {
		let user = await userRepo.findOne({
			where: { id: userId },
		});
		return user;
	}

	static async getUserByEmail(email: string): Promise<User | null> {
		let user = await userRepo.findOne({
			where: { email: email },
		});
		return user;
	}

	static async addUser({
		name,
		email,
		password,
		gender,
		birth,
		profile,
	}: {
		name: string;
		email: string;
		password: string;
		gender: Gender;
		birth?: Date;
		profile?: string;
	}): Promise<User | null> {
		const newUser = userRepo.create({
			name,
			email,
			password,
			gender,
			birth: birth,
			profile: profile,
		});

		const savedUser = await userRepo.save(newUser);
		return savedUser;
	}

	static async updateUser(
		userId: number,
		{
			name,
			gender,
			birth,
			profile,
		}: {
			name?: string;
			gender?: Gender;
			birth?: Date;
			profile?: string;
		}
	): Promise<User | null> {
		const user = await userRepo.findOneBy({ id: userId });

		if (!user) {
			return null;
		}

		userRepo.merge(user, {
			name: name,
			gender: gender,
			birth: birth,
			profile: profile,
		});
		const updatedPost = await userRepo.save(user);
		return updatedPost;
	}

	static async deleteUser(userId: number) {
		const result = await userRepo.delete(userId);
		return result.affected !== 0;
	}
}

export default UserService;
