import { Router, Request, Response } from "express";
import {
  descriptionValidator,
  nameValidator,
  websiteUrlValidator,
} from "../validators/blogValidators";
import { paginationQueries, PaginationParams } from "../helpers/pagination";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { authBaseMiddleware } from "../validators/authValidator";
import { blogViewModel, blogsMapWithPagination } from "../db/db_connection";
import { blogService } from "../services/blogService";
import { postService } from "../services/postService";
import {
  contentInputValidator,
  postTitleInputValidator,
  shortDescriptionValidator,
} from "../validators/postValidators";
import {postQueryRepo} from "../repositories/postQueryRepo";

export const blogsRouter = Router();

const blogsController = {
  getBlogs: async (req: Request, res: Response) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
      }: PaginationParams = paginationQueries(req);
      console.log("paginationQueries(req) --->", paginationQueries(req));
      const blogs: blogsMapWithPagination = await blogService.getAll({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
      });
      res.status(200).send(blogs);
    } catch (error) {
      res.status(500).send("Internal server error: " + error);
    }
  },
  createBlog: async (req: Request, res: Response) => {
    try {
      const newBlog: blogViewModel | null = await blogService.create(req.body);
      // console.log("createdBlog from CONTROLLER --->", newBlog);

      res.status(201).send(newBlog);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const blogId = req.params.id;
      const updateData = req.body;
      const blog: blogViewModel | null = await blogService.getById(blogId);

      if (!blog) {
        res.sendStatus(404);
        return;
      }

      const updatedBlog = await blogService.update(blogId, updateData);
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
      const blog: blogViewModel | null = await blogService.getById(
        req.params.id
      );
      console.log("getbyid from blogController --->", blog);
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
      const blog: blogViewModel | null = await blogService.getById(blogId);
      if (!blog) {
        res.status(404).send();
        return;
      }
      const isDel = await blogService.deleteById(req.params.id);
      if (isDel) {
        res.sendStatus(204);
      } else res.sendStatus(404);
    } catch {
      res.status(500).send("Internal server error");
    }
  },
  createNewPostForThisBlog: async (req: Request, res: Response) => {
    try {
      const { title, shortDescription, content } = req.body;
      const blogId = req.params.id;
      const blog: blogViewModel | null = await blogService.getById(blogId);

      if (!blog) {
        res.status(404).send("blog not exist");
        return;
      }
      const post = await postService.create({
        title,
        shortDescription,
        content,
        blogId,
      });
      console.log("createNewPostForThisBlog CONTROLLER --->", post);
      if (!post) {
        res.sendStatus(404);
        return;
      }
      res.status(201).send(post);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
  getAllPostsForThisBlog: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
        paginationQueries(req);
      const blogExists = await blogService.getById(id);
      if (!blogExists) {
        res.status(404).json({
          errorsMessages: [{ field: "id", message: "Blog not found" }],
        });
        return;
      }
      const posts = await postQueryRepo.getAllPostsForThisBlog(id, {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
      });
      if (!posts) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(posts);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  },
};

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getById);
blogsRouter.get("/:id/posts",  blogsController.getAllPostsForThisBlog);
blogsRouter.post(
  "/:id/posts",
  authBaseMiddleware,
  postTitleInputValidator,
  shortDescriptionValidator,
  contentInputValidator,
  inputCheckErrorsMiddleware,
  blogsController.createNewPostForThisBlog
);
blogsRouter.post(
  "/",
  authBaseMiddleware,
  nameValidator,
  descriptionValidator,
  websiteUrlValidator,
  inputCheckErrorsMiddleware,
  blogsController.createBlog
);
blogsRouter.put(
  "/:id",
  authBaseMiddleware,
  nameValidator,
  descriptionValidator,
  websiteUrlValidator,
  inputCheckErrorsMiddleware,
  blogsController.update
);
blogsRouter.delete(
  "/:id",
  authBaseMiddleware,
  inputCheckErrorsMiddleware,
  blogsController.deleteById
);
