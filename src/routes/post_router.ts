import { Router } from 'express';
import { PostController } from '../controllers/post_controller';

const postRouter = Router();
postRouter.get('/posts', PostController.getPosts);
postRouter.get('/posts/:id', PostController.getPost);
postRouter.post('/posts', PostController.addValidator, PostController.addPost);
postRouter.put('/posts/:id', PostController.updateValidator, PostController.updatePost);
postRouter.delete('/posts/:id', PostController.deletePost);

export default postRouter;
