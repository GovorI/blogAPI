import {Request, Response} from "express";
import {paginationQueries, PaginationParams} from "../helpers/pagination";
import {blogViewModel, IPagination} from "../db/db_connection";
import {BlogService} from "../services/blogService";
import {BlogQueryRepo} from "../repositories/blogQueryRepo";
import {injectable} from "inversify";
import {PostService} from "../services/postService";
import {PostQueryRepo} from "../repositories/postQueryRepo";
import "reflect-metadata"


@injectable()
export class BlogsController {
    constructor(protected blogService: BlogService,
                protected blogQueryRepo: BlogQueryRepo,
                protected postService: PostService,
                protected postQueryRepo: PostQueryRepo) {
    }

    async getBlogs(req: Request, res: Response) {
        try {
            const {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                searchNameTerm,
            }: PaginationParams = paginationQueries(req);
            console.log("paginationQueries(req) --->", paginationQueries(req));
            const blogs: IPagination<blogViewModel[]> = await this.blogQueryRepo.getAll({
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
    }

    async createBlog(req: Request, res: Response) {
        try {
            const newBlog: blogViewModel | null = await this.blogService.create(req.body);
            // console.log("createdBlog from CONTROLLER --->", newBlog);

            res.status(201).send(newBlog);
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }

    async update(req: Request, res: Response) {
        try {
            const blogId = req.params.id;
            const updateData = req.body;
            const blog: blogViewModel | null = await this.blogQueryRepo.getById(blogId);

            if (!blog) {
                res.sendStatus(404);
                return;
            }

            const updatedBlog = await this.blogService.update(blogId, updateData);
            if (!updatedBlog) {
                res.sendStatus(404);
                return;
            }

            res.sendStatus(204);
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const blog: blogViewModel | null = await this.blogQueryRepo.getById(
                req.params.id
            );
            console.log("getbyid from blogController --->", blog);
            if (!blog) {
                res.status(404).json({
                    errorsMessages: [{field: "id", message: "Blog not found"}],
                });
            } else {
                res.status(200).send(blog);
            }
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }

    async deleteById(req: Request, res: Response) {
        try {
            const blogId = req.params.id;
            const blog: blogViewModel | null = await this.blogQueryRepo.getById(blogId);
            if (!blog) {
                res.status(404).send();
                return;
            }
            const isDel = await this.blogService.deleteById(req.params.id);
            if (isDel) {
                res.sendStatus(204);
            } else res.sendStatus(404);
        } catch {
            res.status(500).send("Internal server error");
        }
    }

    async createNewPostForThisBlog(req: Request, res: Response) {
        try {
            const {title, shortDescription, content} = req.body;
            const blogId = req.params.id;
            const blog: blogViewModel | null = await this.blogQueryRepo.getById(blogId);

            if (!blog) {
                res.status(404).send("blog not exist");
                return;
            }
            const post = await this.postService.create({
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
    }

    async getAllPostsForThisBlog(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} =
                paginationQueries(req);
            const blogExists = await this.blogQueryRepo.getById(id);
            if (!blogExists) {
                res.status(404).json({
                    errorsMessages: [{field: "id", message: "Blog not found"}],
                });
                return;
            }
            const posts = await this.postQueryRepo.getAllPostsForThisBlog(id, {
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
    }
}


