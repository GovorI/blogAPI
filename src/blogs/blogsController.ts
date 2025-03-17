import { Router, Request, Response } from "express";
import { blogRepository } from "./blogRepository";
import {
  blogIdValidator,
  descriptionValidator,
  nameValidator,
  websiteUrlValidator,
} from "../validators/blogValidators";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { authMiddleware } from "../validators/authValidator";
import { blogViewModel } from "../db/db_connection";

export const blogsRouter = Router();

const blogsController = {
  getBlogs: async (req: Request, res: Response) => {
    try {
      const blogs = await blogRepository.getAll();
      res.status(200).send(blogs);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  createBlog: async (req: Request, res: Response) => {
    try {
      const newBlog: blogViewModel = await blogRepository.create(req.body);
      res.status(201).send(newBlog);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const blogId = req.params.id;
      const blog = await blogRepository.getById(blogId);
      const updateData = req.body;

      if (!blog) {
        res.sendStatus(404);
        return;
      }

      const updatedBlog = await blogRepository.update(blogId, updateData);
      if (!updatedBlog) {
        res.sendStatus(404);
        return;
      }

      res.sendStatus(204);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const blog = await blogRepository.getById(req.params.id);
      if (!blog) {
        res.status(404).json({
          errorsMessages: [{ field: "id", message: "Blog not found" }],
        });
      } else {
        res.status(200).send(blog);
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  deleteById: async (req: Request, res: Response) => {
    try {
      const blogId = req.params.id;
      const blog = await blogRepository.getById(blogId);
      if (!blog) {
        res.status(404).send();
        return;
      }
      const isDel = await blogRepository.deleteById(req.params.id);
      if (isDel) {
        res.sendStatus(204);
      } else res.sendStatus(404);
    } catch {
      res.status(500).send("Internal server error");
    }
  },
};

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogIdValidator, blogsController.getById);
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
  blogIdValidator,
  nameValidator,
  descriptionValidator,
  websiteUrlValidator,
  inputCheckErrorsMiddleware,
  blogsController.update
);
blogsRouter.delete(
  "/:id",
  authMiddleware,
  blogIdValidator,
  blogsController.deleteById
);
