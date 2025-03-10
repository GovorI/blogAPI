import { blogViewModel, db } from "../db/db";

export type createBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export const blogRepository = {
  getAll: () => {
    return db.blogs;
  },
  getById: (id: string) => {
    return db.blogs.find((b) => b.id === id);
  },
  create: (blogData: createBlogDTO) => {
    const newBlog: blogViewModel = {
      id: new Date().toISOString(),
      ...blogData,
    };
    db.blogs.push(newBlog);
    return newBlog;
  },
  update: (blogId: string, newBlogData: createBlogDTO) => {
    const blogIndex = db.blogs.findIndex((b) => b.id === blogId);
    if (blogIndex === -1) {
      return false;
    }
    const updatedBlog = {
      ...db.blogs[blogIndex],
      ...newBlogData,
    };

    db.blogs[blogIndex] = updatedBlog;
    return updatedBlog;
  },
  deleteById: (id: string) => {
    const index = db.blogs.findIndex((b) => b.id === id);
    if (index > -1) {
      db.blogs.splice(index, 1);
      return true;
    }
    return false;
  },
};
