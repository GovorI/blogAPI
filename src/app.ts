import express from "express";
import { blogsRouter } from "./blogs/blogsController";
import { postsRouter } from "./posts/postsController";
import { testRouter } from "./testing/testingController";
import { SETTINGS } from "./settings";

export const app = express();
app.use(express.json());
console.log(SETTINGS.PATH);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTING, testRouter);
