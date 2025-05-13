import express from "express";
import {testRouter} from "./controllers/testingController";
import {SETTINGS} from "./settings";
import {errorHandlerMiddleware} from "./middlewares/errorHandlerMiddleware";
import cookieParser from "cookie-parser";
import { usersRouter } from "./routs/userRouts";
import {authRouter} from "./routs/authRouts";
import {blogsRouter} from "./routs/blogRouts";
import {postsRouter} from "./routs/postRouts";
import {commentsRouter} from "./routs/commentRouts";
import {securityRouter} from "./routs/securityRouts";

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true)

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTING, testRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.SECURITY, securityRouter);
app.use(errorHandlerMiddleware)
