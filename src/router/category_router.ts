import { Router } from 'express';
import { CategoryController } from '../controller/category_controller';

const categoryRouter = Router();

categoryRouter.get('/categories', CategoryController.getCategories);
categoryRouter.get('/categories/:id', CategoryController.getCategory);
categoryRouter.post('/categories', CategoryController.addCategory);
categoryRouter.put('/categories/:id', CategoryController.updateCategory);
categoryRouter.delete('/categories/:id', CategoryController.deleteCategory);

export default categoryRouter;
