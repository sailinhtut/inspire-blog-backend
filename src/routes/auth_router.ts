import { Router } from 'express';
import AuthController from '../controllers/auth_controller';
import authHandler from '../middlewares/auth_handler';

const authRouter = Router();

authRouter.post('/auth/sign-up', AuthController.registerValidator, AuthController.register);
authRouter.post('/auth/sign-in', AuthController.logInValidator, AuthController.login);

authRouter.get('/users', authHandler, AuthController.getUsers);
authRouter.get('/users/:id', authHandler, AuthController.getUser);
authRouter.put(
	'/users/:id',
	authHandler,
	AuthController.updateValidator,
	AuthController.updateUser
);
authRouter.delete('/users/:id', authHandler, AuthController.deleteUser);

export default authRouter;
