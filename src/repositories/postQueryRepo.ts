import { ObjectId } from "mongodb";
import {
  IPagination,
  postSchemaDB,
  postsCollection, postViewModel,
} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";

type pagingMapDTOPosts = {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  items: postSchemaDB[];
};

export const postQueryRepo = {
  getAll: async ({
                   pageNumber,
                   pageSize,
                   sortBy,
                   sortDirection,
                   searchNameTerm,
                 }: PaginationParams): Promise<IPagination<postViewModel[]> | null> => {
      const filter = searchNameTerm
          ? { name: { $regex: searchNameTerm, $options: "i" } }
          : {};
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
  },
  getPostById: async (id: string):Promise<postViewModel|null> => {
    const result = await postsCollection.findOne({ _id: new ObjectId(id) });
    console.log(result)
    if (!result) return null;
    return  {
      id: result._id.toString(),
      title: result.title,
      shortDescription: result.shortDescription,
      content: result.content,
      blogId: result.blogId.toString(),
      blogName: result.blogName,
      createdAt: result.createdAt.toISOString(),
    };
  },
  getAllPostsForThisBlog: async (
      id: string,
      { pageNumber, pageSize, sortBy, sortDirection }: PaginationParams
  ): Promise<IPagination<postViewModel[]> | null> => {
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
      return mapPostsWithPaging({ totalCount, pageSize, pageNumber, items });
    } catch (error) {
      return null;
    }
  },
};

function mapToViewModel(post: postSchemaDB): postViewModel {
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
                            }: pagingMapDTOPosts) {
  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount,
    items: items.map((post: postSchemaDB) => {
      return mapToViewModel(post);
    }),
  };
}