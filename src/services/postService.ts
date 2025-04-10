import { postRepository } from "../repositories/postRepository";
import { blogRepository } from "../repositories/blogRepository";
import {postViewModel, postsMapWithPagination, commentsCollection} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";
import { postQueryRepo } from "../repositories/postQueryRepo";
import {ObjectId} from "mongodb";
import {commentRepository} from "../repositories/commentRepository";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type createCommentDTO = {
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
};

export const postService = {
  // getAll: async ({
  //   pageNumber,
  //   pageSize,
  //   sortBy,
  //   sortDirection,
  //   searchNameTerm,
  // }: PaginationParams): Promise<postsMapWithPagination | null> => {
  //   try {
  //     const posts = await postRepository.getAll({
  //       pageNumber,
  //       pageSize,
  //       sortBy,
  //       sortDirection,
  //       searchNameTerm,
  //     });
  //     console.log("Get all posts --->", posts);
  //     return posts;
  //   } catch (error) {
  //     return null;
  //   }
  // },
  // getById: async (id: string): Promise<postViewModel | null> => {
  //   try {
  //     const result = await postQueryRepo.getPostById(id);
  //     if (!result) return null;
  //     console.log("res getById --->", result);
  //     return result;
  //   } catch (error) {
  //     return null;
  //   }
  // },
  create: async (postData: createPostDTO) => {
    const blog = await blogRepository.getById(postData.blogId);

    if (!blog) {
      return null;
    }
    const newPost = {
      _id: new ObjectId(),
      title: postData.title,
      shortDescription: postData.shortDescription,
      content: postData.content,
      blogId: postData.blogId,
      blogName: blog.name,
      createdAt: new Date(),
    };

    const result = await postRepository.create(newPost);
    return await postQueryRepo.getPostById(result!.insertedId.toString());
  },
  update: async (postId: string, newPostData: createPostDTO) => {
    try {
      const result = await postRepository.update(postId, newPostData);
      if (!result) return false;
      return true;
    } catch (error) {
      return null;
    }
  },
  deleteById: async (id: string) => {
    try {
      const result = await postRepository.deleteById(id);
      if (!result) return false;
      return true;
    } catch (error) {
      return null;
    }
  },
};
