"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("../config/config"));
const post_1 = require("../models/post");
const user_1 = require("../models/user");
const user_favourite_1 = require("../models/user_favourite");
const comment_1 = require("../models/comment");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: config_1.default.db_host,
    port: config_1.default.db_port,
    username: config_1.default.db_user,
    password: config_1.default.db_password,
    database: config_1.default.db_name,
    synchronize: true,
    logging: false,
    entities: [user_1.User, post_1.Post, user_favourite_1.UserFavorite, comment_1.Comment],
});
