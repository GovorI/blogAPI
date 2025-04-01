import { postRepository } from "../repositories/postRepository";
import { blogRepository } from "../repositories/blogRepository";
import {
  postViewModel,
  postSchemaDB,
  postsMapWithPagination,
} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export const postService = {
  getAll: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: PaginationParams): Promise<postsMapWithPagination | null> => {
    try {
      const posts = await postRepository.getAll({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
      });
      console.log("Get all posts --->", posts);
      return posts;
    } catch (error) {
      return null;
    }
  },
  getById: async (id: string): Promise<postViewModel | null> => {
    try {
      const result = await postRepository.getById(id);
      if (!result) return null;
      console.log("res getById --->", result);
      return result;
    } catch (error) {
      return null;
    }
  },
  create: async (postData: createPostDTO): Promise<postViewModel | null> => {
    try {
      const blog = await blogRepository.getById(postData.blogId);
      console.log("postData in POSTSERVICE blogId ---> ", postData.blogId);
      console.log("postData in POSTSERVICE blog ---> ", blog);

      if (!blog) {
        return null;
      }
      const newPost = {
        ...postData,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: new Date(),
      };

      const result = await postRepository.create(newPost);
      return await postRepository.getById(result.insertedId);
    } catch (error) {
      return null;
    }
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
  getAllPostsForThisBlog: async (
    id: string,
    { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams
  ) => {
    try {
      const result = await postRepository.getAllPostsForThisBlog(id, {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });
      return result;
    } catch (error) {
      return null;
    }
  },
};
