import { Router } from 'express';
import { PostController } from '../controller/post_controller';
import multerUpload from '../service/upload_service';
import { uniqueID } from '../util/id_generator';

const postRouter = Router();

postRouter.get('/posts', PostController.getPosts);
postRouter.get('/posts/:id', PostController.getPost);
postRouter.post(
	'/posts',
	multerUpload([
		{
			fieldName: 'header_image',
			savePath: 'posts',
		},
	]).any(),
	PostController.addPost
);
postRouter.put(
	'/posts/:id',
	multerUpload([
		{
			fieldName: 'header_image',
			savePath: 'posts',
		},
	]).any(),
	PostController.updatePost
);
postRouter.delete('/posts/:id', PostController.deletePost);

export default postRouter;
