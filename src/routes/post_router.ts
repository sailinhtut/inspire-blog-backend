import { Router } from 'express';
import { PostController } from '../controllers/post_controller';
import multerUpload from '../services/upload_service';
import { uniqueID } from '../utils/id_generator';
import multer from 'multer';

const postRouter = Router();

const postFileUploader = multerUpload({
	entries: [
		{
			fieldName: 'header_image',
			savePath: 'posts',
		},
	],
}).any();

postRouter.get('/posts', PostController.getPosts);
postRouter.get('/posts/:id', PostController.getPost);
postRouter.post('/posts', postFileUploader, PostController.addPost);
postRouter.put('/posts/:id', postFileUploader, PostController.updatePost);
postRouter.delete('/posts/:id', PostController.deletePost);

export default postRouter;
