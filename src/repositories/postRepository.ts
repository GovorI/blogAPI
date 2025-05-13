import {ObjectId} from "mongodb";
import {createPostDTO} from "../services/postService";
import {
    postSchemaDB,
    postsCollection,
} from "../db/db_connection";
import {injectable} from "inversify";
import "reflect-metadata"

@injectable()
export class PostRepository {
    async create(postData: postSchemaDB) {
        try {
            const result = await postsCollection.insertOne(postData);
            if (!result) return null;
            return result;
        } catch (error) {
        }
        return null;
    }

    async update(postId: string, newPostData: createPostDTO) {
        try {
            const result = await postsCollection.updateOne(
                {_id: new ObjectId(postId)},
                {$set: newPostData}
            );

            return result.matchedCount === 1;
        } catch (error) {
            return null;
        }
    }

    async deleteById(id: string) {
        try {
            const result = await postsCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            return null;
        }
    }
}


