import {CommentRepository} from "../repositories/commentRepository";
import {CommentQueryRepo} from "../repositories/commentQueryRepo";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import "reflect-metadata"

export type createCommentDTO = {
    postId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
};

export type updateCommentDTO = {
    commentId: string;
    userId: string;
    content: string;
}

@injectable()
export class CommentService {
    constructor(protected commentQueryRepo: CommentQueryRepo,
                protected commentRepository: CommentRepository) {
    }

    async createComment(commentData: createCommentDTO): Promise<string> {
        const newComment = {
            _id: new ObjectId(),
            postId: commentData.postId,
            content: commentData.content,
            commentatorInfo: {
                userId: commentData.commentatorInfo.userId,
                userLogin: commentData.commentatorInfo.userLogin
            },
            createdAt: new Date(),
        }

        const commentId = await this.commentRepository.createComment(newComment);
        console.log("comment ---->", commentId)
        return commentId.toString();
    }

    async updateComment(commentData: updateCommentDTO): Promise<boolean> {
        const comment = await this.commentQueryRepo.getCommentById(commentData.commentId)
        console.log(comment)
        if (!comment) {
            throw new DomainExceptions(404, 'Comment not found!');
        }
        const isUserOwnerComment = comment.commentatorInfo.userId === commentData.userId
        console.log(isUserOwnerComment)
        if (!isUserOwnerComment) {
            throw new DomainExceptions(403, "You are not author of this comment")
        }
        const result = await this.commentRepository.update(commentData.commentId, commentData.content);
        console.log("isUpdated", result)
        return result;
    }

    async deleteCommentById(userId: string, id: string): Promise<boolean> {
        const comment = await this.commentQueryRepo.getCommentById(id)
        console.log(comment)
        if (!comment) {
            throw new DomainExceptions(404, "Comment not found!");
        }
        const isOwner = comment.commentatorInfo.userId === userId.toString();
        console.log(userId)
        console.log(isOwner)
        if (!isOwner) {
            throw new DomainExceptions(403, "You are not the author of this comment");
        }
        return await this.commentRepository.deleteById(id)

    }
}
