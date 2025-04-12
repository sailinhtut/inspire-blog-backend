import { Category } from '../../models/category';
import { categoryRepo } from '../../controllers/category_controller';

class CategoryService {
	static async getCategories(): Promise<Category[]> {
		const categories = await categoryRepo.find(); // No relations
		return categories;
	}

	static async getPagniatedCateogries({
		page,
		size,
	}: {
		page: number;
		size: number;
	}): Promise<any> {
		const [categories, total] = await categoryRepo.findAndCount({
			skip: (page - 1) * size,
			take: size,
		});

		const lastPage = Math.ceil(total / size);
		const nextPage = page < lastPage ? page + 1 : null;
		const data = categories.map((category) => category.toJsonResponse());

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

	static async getCategory(categoryId: number): Promise<Category | null> {
		const category = await categoryRepo.findOneBy({ id: categoryId });
		return category;
	}

	static async addCategory({
		name,
		description,
	}: {
		name: string;
		description?: string;
	}): Promise<Category> {
		const newCategory = categoryRepo.create({
			name,
			description,
		});
		const savedCategory = await categoryRepo.save(newCategory);
		return savedCategory;
	}

	static async updateCategory(
		categoryId: number,
		{ name, description }: { name?: string; description?: string }
	): Promise<Category | null> {
		const category = await categoryRepo.findOneBy({ id: categoryId });
		if (!category) {
			return null;
		}

		categoryRepo.merge(category, { name, description });
		const updatedCategory = await categoryRepo.save(category);
		return updatedCategory;
	}

	static async deleteCategory(categoryId: number): Promise<boolean> {
		const result = await categoryRepo.delete(categoryId);
		return result.affected !== 0;
	}
}

export default CategoryService;
