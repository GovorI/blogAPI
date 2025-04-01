import { ObjectId } from "mongodb";
import {
  blogsCollection,
  blogSchemaDB,
  blogViewModel,
  blogsMapWithPagination,
} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";
import { createBlogDTO } from "../services/blogService";

export const blogRepository = {
  getAll: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: PaginationParams): Promise<blogsMapWithPagination> => {
    const filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: "i" } }
      : {};
    const [items, totalCount] = await Promise.all([
      blogsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      blogsCollection.countDocuments(filter),
    ]);
    console.log("mapped data from BLOGREPO ITEMS ---> ", items);
    const res = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: items.map((blog: blogSchemaDB) => {
        return mapToViewModel(blog);
      }),
    };
    console.log("mapped data from BLOGREPO ---> ", res);
    return res;
  },
  getById: async (id: string) => {
    try {
      const result = await blogsCollection.findOne({ _id: new ObjectId(id) });

      if (!result) {
        return null;
      }
      const res = mapToViewModel(result);
      // console.log("getbyid from blogRepository --->", res);
      return res;
    } catch (error) {
      console.error("Invalid ID format:", error);
      return null;
    }
  },
  create: async (blogData: createBlogDTO) => {
    try {
      const result = await blogsCollection.insertOne(blogData);
      console.log("Create Blog --->", result);
      return result;
    } catch (error) {
      return null;
    }
  },
  update: async (blogId: string, newBlogData: createBlogDTO) => {
    try {
      const result = await blogsCollection.updateOne(
        { _id: new ObjectId(blogId) },
        {
          $set: {
            name: newBlogData.name,
            description: newBlogData.description,
            websiteUrl: newBlogData.websiteUrl,
          },
        }
      );
      const res = await blogRepository.getById(blogId);
      // console.log("blogrepository UPDATE", res);
      if (result.matchedCount === 0) {
        return null;
      }
      return res;
    } catch (error) {
      return null;
    }
  },
  deleteById: async (id: string) => {
    try {
      const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      return null;
    }
  },
};

function mapToViewModel(blog: blogSchemaDB) {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    isMembership: blog.isMembership || false,
    createdAt: blog.createdAt.toISOString(),
  };
}
