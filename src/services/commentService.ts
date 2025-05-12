import { postRepository } from "../repositories/postRepository";
import {commentRepository} from "../repositories/commentRepository";
import {commentQueryRepo} from "../repositories/commentQueryRepo";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {commentSchemaDB} from "../db/db_connection";
import {ObjectId} from "mongodb";

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

export const commentService = {
  createComment: async (commentData: createCommentDTO):Promise<string> => {
    const newComment ={
      _id: new ObjectId(),
      postId: commentData.postId,
      content: commentData.content,
      commentatorInfo: {
        userId: commentData.commentatorInfo.userId,
        userLogin: commentData.commentatorInfo.userLogin
      },
      createdAt: new Date(),
    }

    const commentId = await commentRepository.createComment(newComment);
    console.log("comment ---->",commentId)
    return commentId.toString();
  },
  updateComment: async (commentData: updateCommentDTO): Promise<boolean> => {
    const comment = await commentQueryRepo.getCommentById(commentData.commentId)
    console.log(comment)
    if (!comment) {throw new DomainExceptions(404, 'Comment not found!');}
    const isUserOwnerComment = comment.commentatorInfo.userId === commentData.userId
    console.log(isUserOwnerComment)
    if (!isUserOwnerComment) {throw new DomainExceptions(403, "You are not author of this comment")}
    const result = await commentRepository.update(commentData.commentId, commentData.content);
    console.log("isUpdated",result)
    return result;


  },

  deleteCommentById: async (userId: string, id: string): Promise<boolean>=> {
    const comment = await commentQueryRepo.getCommentById(id)
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
    return await commentRepository.deleteById( id)

  },
};
