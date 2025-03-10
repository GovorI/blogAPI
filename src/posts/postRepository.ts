import { blogRepository } from "../blogs/blogRepository";
import { db } from "../db/db";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export const postRepository = {
  getAll: () => {
    return db.posts;
  },
  getById: (id: string) => {
    return db.posts.find((p) => p.id === id);
  },
  create: (postData: createPostDTO) => {
    const blog = blogRepository.getById(postData.blogId);
    if (!blog) {
      return false;
    }
    const newPost = {
      id: new Date().toISOString(),
      ...postData,
      blogName: blog.name,
    };
    db.posts.push(newPost);
    return newPost;
  },
  update: (postId: string, newPostData: createPostDTO) => {
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    const blog = blogRepository.getById(newPostData.blogId);
    if (!blog) {
      return false;
    }
    const updatedPost = {
      ...db.posts[postIndex],
      ...newPostData,
      blogName: blog.name,
    };

    db.posts[postIndex] = updatedPost;
    return updatedPost;
  },
  deleteById: (id: string) => {
    const index = db.posts.findIndex((p) => p.id === id);
    if (index > -1) {
      db.posts.splice(index, 1);
      return true;
    }
    return false;
  },
};
