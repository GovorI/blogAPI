import {Request, Response} from "express";
import {PostService} from "../services/postService";
import {PaginationParams, paginationQueries} from "../helpers/pagination";
import {PostQueryRepo} from "../repositories/postQueryRepo";
import {injectable} from "inversify";
import {CommentService} from "../services/commentService";
import {CommentQueryRepo} from "../repositories/commentQueryRepo";
import "reflect-metadata"


@injectable()
export class PostsController {
    constructor(protected postQueryRepo: PostQueryRepo,
                protected postService: PostService,
                protected commentService: CommentService,
                protected commentQueryRepo: CommentQueryRepo,) {
    }

    async getAll(req: Request, res: Response) {
        try {
            const {pageNumber, pageSize, sortBy, sortDirection}: PaginationParams =
                paginationQueries(req);
            const posts = await this.postQueryRepo.getAll({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            });
            res.status(200).send(posts);
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const post = await this.postQueryRepo.getPostById(req.params.id);
            if (!post) {
                res.status(404).json({
                    errorsMessages: [{field: "id", message: "post not found"}],
                });
                return;
            }

            res.status(200).send(post);
        } catch (error) {
            res.status(404).send("Invalid id format");
        }
    }

    async createPost(req: Request, res: Response) {
        try {
            const postData = {
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                content: req.body.content,
                blogId: req.body.blogId,
            }
            const newPost = await this.postService.create(postData);
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
    }

    async update(req: Request, res: Response) {
        try {
            const postId = req.params.id;
            const updateData = req.body;

            const updatedPost = await this.postService.update(postId, updateData);
            if (!updatedPost) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(204);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error");
        }
    }

    async deleteById(req: Request, res: Response) {
        try {
            const isDeleted = await this.postService.deleteById(req.params.id);
            if (isDeleted) {
                res.sendStatus(204);
                return;
            }
            res.sendStatus(404);
            return;
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    }

    async createComment(req: Request, res: Response) {
        const postId = req.params.id;
        const content = req.body.content;
        const userId = req.user!._id.toString();
        const login = req.user!.accountData.login;

        console.log("postId from postControllet --- >", postId);

        const post = await this.postQueryRepo.getPostById(postId);
        console.log("finded post ----->", post)
        if (!post) {
            res.status(404).send("post not found");
            return;
        }
        const commentId = await this.commentService.createComment({
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
        const comment = await this.commentQueryRepo.getCommentById(commentId);
        console.log(comment)
        res.status(201).send(comment);
    }

    async getCommentsWithPagination(req: Request, res: Response) {
        const postId = req.params.id
        const isPost = await this.postQueryRepo.getPostById(postId);
        if (!isPost) {
            res.sendStatus(404);
            return
        }
        const {pageNumber, pageSize, sortBy, sortDirection}: PaginationParams =
            paginationQueries(req);
        const comments = await this.commentQueryRepo
            .getCommentsWithPagination(postId, {pageNumber, pageSize, sortBy, sortDirection})
        res.status(200).send(comments)
    }
}

