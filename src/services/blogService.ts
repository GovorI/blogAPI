import { blogRepository } from "../repositories/blogRepository";
import {ObjectId} from "mongodb";
import {blogQueryRepo} from "../repositories/blogQueryRepo";

export type createBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export const blogService = {
  create: async (blogData: createBlogDTO) => {
    const newBlog = {
      _id: new ObjectId(),
      name: blogData.name,
      description: blogData.description,
      websiteUrl: blogData.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    const result = await blogRepository.create(newBlog);
    // console.log("Create Blog --->", result);

    const blog = await blogQueryRepo.getById(result!.insertedId.toString());
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
