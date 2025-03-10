import { Router, Request, Response } from "express";
import { postRepository } from "./postRepository";
import {
  blogIdValidator,
  contentInputValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
} from "../validators/postValidators";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import {
  checkBlogExistenceForPost,
  findBlogValidator,
} from "../validators/blogValidators";
import { authMiddleware } from "../validators/authValidator";

export const postsRouter = Router();

const postsController = {
  getAll: (req: Request, res: Response) => {
    const posts = postRepository.getAll();
    res.status(200).send(posts);
  },
  getById: (req: Request, res: Response) => {
    const post = postRepository.getById(req.params.id);
    if (post) {
      res.status(200).send(post);
    } else res.sendStatus(404);
  },
  create: (req: Request, res: Response) => {
    const newPost = postRepository.create(req.body);
    if (newPost) {
      res.status(201).send(newPost);
    } else res.sendStatus(400);
    // .json({ errorsMessages: [{}] });
  },
  update: (req: Request, res: Response) => {
    const postId = req.params.id;
    const updateData = req.body;

    const updatedPost = postRepository.update(postId, updateData);
    if (!updatedPost) {
      res.sendStatus(404);
      return;
    }

    res.status(204).send(updatedPost);
  },
  deleteById: (req: Request, res: Response) => {
    const isDeleted = postRepository.deleteById(req.params.id);
    if (isDeleted) {
      res.sendStatus(204);
    } else res.sendStatus(404);
  },
};

postsRouter.get("/", postsController.getAll);
postsRouter.get("/:id", postsController.getById);
postsRouter.post(
  "/",
  authMiddleware,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  blogIdValidator,
  // checkBlogExistenceForPost,
  // findBlogValidator, // проверяем есть ли блог
  inputCheckErrorsMiddleware,
  postsController.create
);
postsRouter.put(
  "/:id",
  authMiddleware,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  blogIdValidator,
  // checkBlogExistenceForPost,
  // findBlogValidator, // проверяем есть ли блог
  inputCheckErrorsMiddleware,
  postsController.update
);
postsRouter.delete("/:id", authMiddleware, postsController.deleteById);
