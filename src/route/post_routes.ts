import { Router } from 'express';
import { getAllPosts, createPost } from '../controller/post_controller';

const router = Router();

router.get('/posts', getAllPosts);
router.post('/posts', createPost);

export default router;
