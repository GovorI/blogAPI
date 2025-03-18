import { ObjectId } from "mongodb";
import { blogRepository } from "../blogs/blogRepository";
import {
  postSchema,
  postsCollection,
  postViewModel,
} from "../db/db_connection";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export const postRepository = {
  getAll: async () => {
    const posts = await postsCollection.find({}).toArray();
    const result = posts.map((post: postSchema) => ({
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    }));
    console.log("Get all posts --->", result);
    return result;
  },
  getById: async (id: string) => {
    try {
      const result = await postsCollection.findOne({ _id: new ObjectId(id) });
      if (!result) return null;
      const res = {
        id: result._id.toString(),
        title: result.title,
        shortDescription: result.shortDescription,
        content: result.content,
        blogId: result.blogId.toString(),
        blogName: result.blogName,
        createdAt: result.createdAt.toISOString(),
      };
      console.log("res getById --->", res);
      return res;
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
    return await postRepository.getById(result.insertedId);
    // return {
    //   id: result.insertedId.toString(),
    //   ...newPost,
    //   createdAt: newPost.createdAt.toISOString(),
    // };
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
