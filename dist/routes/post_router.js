"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post_controller");
const auth_handler_1 = __importDefault(require("../middlewares/auth_handler"));
const comment_controller_1 = require("../controllers/comment_controller");
const postRouter = (0, express_1.Router)();
postRouter.get('/posts', auth_handler_1.default, post_controller_1.PostController.getPosts);
postRouter.get('/posts/:id', post_controller_1.PostController.getPost);
postRouter.post('/posts', post_controller_1.PostController.addValidator, post_controller_1.PostController.addPost);
postRouter.put('/posts/:id', post_controller_1.PostController.updateValidator, post_controller_1.PostController.updatePost);
postRouter.delete('/posts/:id', post_controller_1.PostController.deletePost);
postRouter.post('/posts/:id/like', post_controller_1.PostController.likePost);
postRouter.post('/posts/:id/unlike', post_controller_1.PostController.unlikePost);
// Comments
postRouter.get('/posts/:postId/comments', auth_handler_1.default, comment_controller_1.CommentController.getComments);
postRouter.post('/posts/:postId/comments', auth_handler_1.default, comment_controller_1.CommentController.addValidator, comment_controller_1.CommentController.addComment);
postRouter.delete('/posts/:postId/comments/:commentId', auth_handler_1.default, comment_controller_1.CommentController.deleteComment);
exports.default = postRouter;
