import { Router, Request, Response } from "express";
import { postRepository } from "../repositories/postRepository";
import {
  contentInputValidator,
  postIdValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
} from "../validators/postValidators";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { authMiddleware } from "../validators/authValidator";
import { postService } from "../services/postService";
import { PaginationParams, paginationQueries } from "../helpers/pagination";

export const postsRouter = Router();

const postsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      // const posts = await postService.getAll();
      // res.status(200).send(posts);
      const { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams =
        paginationQueries(req);
      const posts = await postService.getAll({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });
      res.status(200).send(posts);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const post = await postService.getById(req.params.id);
      if (!post) {
        res.status(404).json({
          errorsMessages: [{ field: "id", message: "post not found" }],
        });
        return;
      }
      // const mappedPost = {
      //   id: post._id.toString()
      // }

      res.status(200).send(post);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const newPost = await postService.create(req.body);
      console.log("newPost in CONTROLLER req.body ---> ", req.body);
      console.log("newPost in CONTROLLER ---> ", newPost);
      if (!newPost) {
        res.sendStatus(404);
        return;
      }
      res.status(201).send(newPost);
      return;
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const updateData = req.body;

      const updatedPost = await postService.update(postId, updateData);
      if (!updatedPost) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  },
  deleteById: async (req: Request, res: Response) => {
    try {
      const isDeleted = await postService.deleteById(req.params.id);
      if (isDeleted) {
        res.sendStatus(204);
        return;
      }
      res.sendStatus(404);
      return;
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
};

postsRouter.get("/", postsController.getAll);
postsRouter.get("/:id", postIdValidator, postsController.getById);
postsRouter.post(
  "/",
  authMiddleware,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  // blogIdValidator,
  // checkBlogExistenceForPost,
  inputCheckErrorsMiddleware,
  postsController.create
);
postsRouter.put(
  "/:id",
  authMiddleware,
  postIdValidator,
  // blogIdValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  // checkBlogExistenceForPost,
  inputCheckErrorsMiddleware,
  postsController.update
);
postsRouter.delete(
  "/:id",
  authMiddleware,
  postIdValidator,
  inputCheckErrorsMiddleware,
  postsController.deleteById
);
