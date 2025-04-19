import { Router, Request, Response } from "express";
import {
  contentInputValidator,
  postIdValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
} from "../validators/postValidators";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { postService } from "../services/postService";
import { PaginationParams, paginationQueries } from "../helpers/pagination";
import { postQueryRepo } from "../repositories/postQueryRepo";
import { authJWTMiddleware } from "../middlewares/authMiddleware";
import { authBaseMiddleware } from "../validators/authValidator";
import {commentQueryRepo} from "../repositories/commentQueryRepo";
import {commentService} from "../services/commentService";
import {contentInputValidatorComment} from "../validators/commentValidators";

export const postsRouter = Router();

const postsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams =
        paginationQueries(req);
      const posts = await postQueryRepo.getAll({
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
      const post = await postQueryRepo.getPostById(req.params.id);
      if (!post) {
        res.status(404).json({
          errorsMessages: [{ field: "id", message: "post not found" }],
        });
        return;
      }

      res.status(200).send(post);
    } catch (error) {
      res.status(404).send("Invalid id format");
    }
  },
  createPost: async (req: Request, res: Response) => {
    try {
      const postData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId,
      }
      const newPost = await postService.create(postData);
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
  createComment: async (req: Request, res: Response) => {
    const postId = req.params.id;
    const content = req.body.content;
    const userId = req.user!._id.toString();
    const login = req.user!.accountData.login;

    console.log("postId from postControllet --- >",postId);

    const post = await postQueryRepo.getPostById(postId);
    console.log("finded post ----->",post)
    if (!post) {
      res.status(404).send("post not found");
      return;
    }
    const commentId = await commentService.createComment({
      postId: postId,
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: login,
      }
    });
    console.log('created comment with commentId ---->', commentId)
    if (!commentId) {
      res.sendStatus(404);
      return;
    }
    const comment = await commentQueryRepo.getCommentById(commentId);
    console.log(comment)
    res.status(201).send(comment);
  },
  getCommentsWithPagination: async (req: Request, res: Response) => {
    const postId = req.params.id
    const isPost = await postQueryRepo.getPostById(postId);
    if(!isPost) {
      res.sendStatus(404);
      return
    }
    const { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams =
        paginationQueries(req);
    const comments = await commentQueryRepo
        .getCommentsWithPagination(postId, {pageNumber, pageSize, sortBy, sortDirection})
  res.status(200).send(comments)
  }
};

postsRouter.get("/", postsController.getAll);
postsRouter.get("/:id/comments", postsController.getCommentsWithPagination);
postsRouter.get("/:id", postIdValidator, postsController.getById);
postsRouter.post(
  "/",
  authBaseMiddleware,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  inputCheckErrorsMiddleware,
  postsController.createPost
);
postsRouter.post(
  "/:id/comments",
  authJWTMiddleware,
  postIdValidator,
  contentInputValidatorComment,
  inputCheckErrorsMiddleware,
  postsController.createComment
);
postsRouter.put(
  "/:id",
  authBaseMiddleware,
  postIdValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  inputCheckErrorsMiddleware,
  postsController.update
);
postsRouter.delete(
  "/:id",
  authBaseMiddleware,
  postIdValidator,
  inputCheckErrorsMiddleware,
  postsController.deleteById
);
