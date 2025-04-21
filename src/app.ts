import express from "express";
import { blogsRouter } from "./controllers/blogsController";
import { postsRouter } from "./controllers/postsController";
import { usersRouter } from "./controllers/userController";
import { testRouter } from "./controllers/testingController";
import { SETTINGS } from "./settings";
import { authRouter } from "./controllers/authController";
import {commentsRouter} from "./controllers/commentsController";
import {errorHandlerMiddleware} from "./middlewares/errorHandlerMiddleware";
import cookieParser from "cookie-parser";

export const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTING, testRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(errorHandlerMiddleware)
