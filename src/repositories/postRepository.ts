import { ObjectId } from "mongodb";
import { blogRepository } from "./blogRepository";
import {
  postModel,
  postSchema,
  postsCollection,
  postViewModel,
} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";

export type createPostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

type pagingMapDTO = {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  items: postSchema[];
};

export const postRepository = {
  getAll: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: PaginationParams): Promise<postViewModel | null> => {
    try {
      const filter = searchNameTerm
        ? { name: { $regex: searchNameTerm, $options: "i" } }
        : {};
      // const posts = await postsCollection.find({}).toArray();
      const [items, totalCount] = await Promise.all([
        postsCollection
          .find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        postsCollection.countDocuments(filter),
      ]);
      return mapPostsWithPaging({ totalCount, pageSize, pageNumber, items });

      // const result = posts.map((post: postSchema) => ({
      //   id: post._id.toString(),
      //   title: post.title,
      //   shortDescription: post.shortDescription,
      //   content: post.content,
      //   blogId: post.blogId,
      //   blogName: post.blogName,
      //   createdAt: post.createdAt,
      // }));
      // console.log("Get all posts --->", result);
      // return result;
    } catch (error) {
      return null;
    }
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
      return res;
    } catch (error) {
      return null;
    }
  },
  create: async (postData: createPostDTO) => {
    try {
      const result = await postsCollection.insertOne(postData);
      if (!result) return null;
      return result;
    } catch (error) {}
    return null;
  },
  update: async (postId: string, newPostData: createPostDTO) => {
    try {
      const result = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: newPostData }
      );

      return result.matchedCount === 1;
    } catch (error) {
      return null;
    }
  },
  deleteById: async (id: string) => {
    try {
      const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      return null;
    }
  },
  getAllPostsForThisBlog: async (
    id: string,
    { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams
  ): Promise<postViewModel | null> => {
    try {
      const filter = { blogId: id };
      const [items, totalCount] = await Promise.all([
        postsCollection
          .find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        postsCollection.countDocuments(filter),
      ]);
      console.log("--------------------------->", items);
      return mapPostsWithPaging({ totalCount, pageSize, pageNumber, items });
    } catch (error) {
      return null;
    }
  },
};

function mapToViewModel(post: postSchema): postModel {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
  };
}

function mapPostsWithPaging({
  totalCount,
  pageSize,
  pageNumber,
  items,
}: pagingMapDTO) {
  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount,
    items: items.map((post: postSchema) => {
      return mapToViewModel(post);
    }),
  };
}
