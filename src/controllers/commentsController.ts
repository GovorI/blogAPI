import {Request, Response, NextFunction} from "express";
import {CommentService} from "../services/commentService";
import {injectable} from "inversify";
import {CommentQueryRepo} from "../repositories/commentQueryRepo";
import "reflect-metadata"


@injectable()
export class CommentsController {
    constructor(protected commentQueryRepo: CommentQueryRepo,
                protected commentService: CommentService) {
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.params.commentId);
            const result = await this.commentQueryRepo.getCommentById(req.params.id);
            console.log("get CommentById --->", result)
            // if (!result) {
            //     res.sendStatus(404)
            //     return
            // }
            res.status(200).send(result)
            return
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const commentId = req.params.id
            const content = req.body.content
            const userId = req.user!._id.toString()
            const isUpdated = await this.commentService.updateComment({commentId, content, userId})
            // if (!isUpdated) {
            //     res.sendStatus(404)
            //     return
            // }
            res.sendStatus(204)
            return
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const commentId = req.params.id
            const userId = req.user!._id.toString()
            const isDelete = await this.commentService.deleteCommentById(userId, commentId)
            // if (!isDelete) {
            //     res.sendStatus(404)
            //     return
            // }
            res.sendStatus(204)
            return
        } catch (error) {
            next(error);
        }
    }
}

