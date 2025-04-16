import { Router } from 'express';
import AuthController from '../controllers/auth_controller';
import authHandler from '../middlewares/auth_handler';

import { UserFavouriteController } from '../controllers/user_favourite_controller';

const authRouter = Router();

authRouter.post('/auth/sign-up', AuthController.registerValidator, AuthController.register);
authRouter.post('/auth/sign-in', AuthController.logInValidator, AuthController.login);

authRouter.post('/auth/send-verification-email/:id',AuthController.sendVerificationEmail);
authRouter.get('/auth/verify-email',AuthController.verifyEmail);


authRouter.get('/users', authHandler, AuthController.getUsers);
authRouter.get('/users/:id', authHandler, AuthController.getUser);
authRouter.put(
	'/users/:id',
	authHandler,
	AuthController.updateValidator,
	AuthController.updateUser
);
authRouter.delete('/users/:id', authHandler, AuthController.deleteUser);

// Favourite Posts
authRouter.get('/users/:id/favourites', authHandler, UserFavouriteController.getUserFavourites);
authRouter.post(
	'/users/:id/favourites',
	authHandler,
	UserFavouriteController.addValidator,
	UserFavouriteController.addFavourite
);
authRouter.delete(
	'/users/:id/favourites',
	authHandler,
	UserFavouriteController.removeValidator,
	UserFavouriteController.removeFavourite
);


export default authRouter;
