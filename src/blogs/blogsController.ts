import { Router, Request, Response } from "express";
import { blogRepository } from "./blogRepository";
import {
  blogIdValidator,
  descriptionValidator,
  checkBlogExistenceForPost,
  nameValidator,
  websiteUrlValidator,
} from "../validators/blogValidators";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { authMiddleware } from "../validators/authValidator";

export const blogsRouter = Router();

const blogsController = {
  getBlogs: (req: Request, res: Response) => {
    const blogs = blogRepository.getAll();
    res.status(200).send(blogs);
  },
  createBlog: (req: Request, res: Response) => {
    const newBlog = blogRepository.create(req.body);
    res.status(201).send(newBlog);
  },
  update: (req: Request, res: Response) => {
    const blogId = req.params.id;
    const updateData = req.body;

    const updatedBlog = blogRepository.update(blogId, updateData);
    if (!updatedBlog) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },
  getById: (req: Request, res: Response) => {
    const blog = blogRepository.getById(req.params.id);
    console.log(blog);
    if (!blog) {
      res.sendStatus(404).json({
        errorsMessages: [{ field: "id", message: "Blog not found" }],
      });
    } else res.status(200).send(blog);
  },
  deleteById: (req: Request, res: Response) => {
    const isDel = blogRepository.deleteById(req.params.id);
    if (isDel) {
      res.sendStatus(204);
    } else res.sendStatus(404);
  },
};

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get(
  "/:id",
  blogIdValidator,
  inputCheckErrorsMiddleware,
  blogsController.getById
);
blogsRouter.post(
  "/",
  authMiddleware,
  nameValidator,
  descriptionValidator,
  websiteUrlValidator,
  inputCheckErrorsMiddleware,
  blogsController.createBlog
);
blogsRouter.put(
  "/:id",
  authMiddleware,
  nameValidator,
  descriptionValidator,
  websiteUrlValidator,
  blogIdValidator,
  checkBlogExistenceForPost,
  inputCheckErrorsMiddleware,
  blogsController.update
);
blogsRouter.delete("/:id", authMiddleware, blogsController.deleteById);
