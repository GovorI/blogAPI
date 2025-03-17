import { ObjectId } from "mongodb";
import { blogsCollection, blogViewModel } from "../db/db_connection";

export type createBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export const blogRepository = {
  getAll: async (): Promise<blogViewModel[]> => {
    return blogsCollection.find({}).toArray();
  },
  getById: async (id: string) => {
    try {
      const result = await blogsCollection.findOne({ _id: new ObjectId(id) });

      if (!result) {
        return null;
      }

      return {
        _id: result._id.toString(),
        name: result.name,
        description: result.description,
        websiteUrl: result.websiteUrl,
        createdAt: result.createdAt.toISOString(),
        isMembership: result.isMembership || false,
      };
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
    const result = await blogsCollection.insertOne(newBlog);
    console.log(result);
    return {
      _id: result.insertedId.toString(),
      ...newBlog,
      createdAt: newBlog.createdAt.toISOString(),
    };
  },
  update: async (blogId: string, newBlogData: createBlogDTO) => {
    try {
      const result = await blogsCollection.updateOne(
        { _id: new ObjectId(blogId) },
        { $set: newBlogData }
      );
      return result.modifiedCount === 1;
    } catch (error) {
      return false;
    }
  },
  deleteById: async (id: string) => {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};
