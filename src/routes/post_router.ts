import { Router } from 'express';
import { PostController } from '../controllers/post_controller';
import authHandler from '../middlewares/auth_handler';

const postRouter = Router();

postRouter.get('/posts', authHandler, PostController.getPosts);
postRouter.get('/posts/:id', PostController.getPost);
postRouter.post('/posts', PostController.addValidator, PostController.addPost);
postRouter.put('/posts/:id', PostController.updateValidator, PostController.updatePost);
postRouter.delete('/posts/:id', PostController.deletePost);

export default postRouter;
