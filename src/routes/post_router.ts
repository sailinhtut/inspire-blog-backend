import { Router } from 'express';
import { PostController } from '../controllers/post_controller';
import authHandler from '../middlewares/auth_handler';
import { CommentController } from '../controllers/comment_controller';


const postRouter = Router();

postRouter.get('/posts', authHandler, PostController.getPosts);
postRouter.get('/posts/:id', PostController.getPost);
postRouter.post('/posts', PostController.addValidator, PostController.addPost);
postRouter.put('/posts/:id', PostController.updateValidator, PostController.updatePost);
postRouter.delete('/posts/:id', PostController.deletePost);
postRouter.post('/posts/:id/like',PostController.likePost);
postRouter.post('/posts/:id/unlike',PostController.unlikePost);

// Comments
postRouter.get('/posts/:postId/comments', authHandler, CommentController.getComments);
postRouter.post(
	'/posts/:postId/comments',
	authHandler,
	CommentController.addValidator,
	CommentController.addComment
);
postRouter.delete(
	'/posts/:postId/comments/:commentId',
	authHandler,
	CommentController.deleteComment
);

export default postRouter;
