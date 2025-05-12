import { ObjectId } from "mongodb";
import {  createPostDTO } from "../services/postService";
import {
  postSchemaDB,
  postsCollection,
} from "../db/db_connection";



export const postRepository = {
  create: async (postData:postSchemaDB) => {
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
};


