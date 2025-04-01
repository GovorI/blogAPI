import { blogRepository } from "../repositories/blogRepository";
import { blogSchemaDB, blogsMapWithPagination } from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";

export type createBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export const blogService = {
  getAll: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: PaginationParams): Promise<blogsMapWithPagination> => {
    const blogs = await blogRepository.getAll({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    });
    return blogs;
  },
  getById: async (id: string) => {
    try {
      const result = await blogRepository.getById(id);
      if (!result) {
        return null;
      }
      return result;
    } catch (error) {
      // console.error("Invalid ID format:", error);
      return null;
    }
  },
  create: async (blogData: createBlogDTO) => {
    const newBlog = {
      ...blogData,
      createdAt: new Date(),
      isMembership: false,
    };
    const result = await blogRepository.create(newBlog);
    // console.log("Create Blog --->", result);
    const blog = await blogRepository.getById(result.insertedId);
    // console.log("Created Blog --->", blog);
    return blog;
  },
  update: async (blogId: string, newBlogData: createBlogDTO) => {
    try {
      const result = await blogRepository.update(blogId, newBlogData);
      if (!result) {
        return null;
      }
      return result;
    } catch (error) {
      return false;
    }
  },
  deleteById: async (id: string) => {
    try {
      const result = await blogRepository.deleteById(id);
      return result;
    } catch (error) {
      return null;
    }
  },
};
