import express from "express";
import { blogsRouter } from "./controllers/blogsController";
import { postsRouter } from "./controllers/postsController";
import { testRouter } from "./controllers/testingController";
import { SETTINGS } from "./settings";

export const app = express();
app.use(express.json());

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTING, testRouter);
