import { ObjectId } from "mongodb";
import { blogRepository } from "../blogs/blogRepository";
import { postsCollection } from "../db/db_connection";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export const postRepository = {
  getAll: async () => {
    return postsCollection.find({}).toArray();
  },
  getById: async (id: string) => {
    try {
      const result = await postsCollection.findOne({ _id: new ObjectId(id) });
      if (!result) return null;
      return {
        _id: result._id.toString(),
        title: result.title,
        shortDescription: result.shortDescription,
        content: result.content,
        blogId: result.blogId.toString(),
        blogName: result.blogName,
        createdAt: result.createdAt.toISOString(),
      };
    } catch (error) {
      return null;
    }
  },
  create: async (postData: createPostDTO) => {
    const blog = await blogRepository.getById(postData.blogId);
    if (!blog) {
      return false;
    }
    const newPost = {
      ...postData,
      blogName: blog.name,
      createdAt: new Date(),
    };

    const result = await postsCollection.insertOne(newPost);
    return {
      _id: result.insertedId.toString(),
      ...newPost,
      createdAt: newPost.createdAt.toISOString(),
    };
  },
  update: async (postId: string, newPostData: createPostDTO) => {
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: newPostData }
    );

    return result.matchedCount === 1;
  },
  deleteById: async (id: string) => {
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};
