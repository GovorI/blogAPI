import { ObjectId } from "mongodb";
import { createCommentDTO} from "../services/postService";
import {
    commentSchemaDB,
    commentsCollection,
} from "../db/db_connection";

export const commentRepository = {
    update: async (commentId: string, newCommentData: string) => {
        try {
            const result = await commentsCollection.updateOne(
                { _id: new ObjectId(commentId) },
                { $set: {content: newCommentData} }
            );

            return result.matchedCount === 1;
        } catch (error) {
            return false;
        }
    },
    deleteById: async ( id: string): Promise<boolean> => {
            const result = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
            console.log(result)
            return result.deletedCount === 1;

    },

    createComment: async (commentData: commentSchemaDB) => {
        const comment = await commentsCollection.insertOne( commentData );
        console.log("comment from DB----->", comment)
        if (!comment) throw new Error("comment not created");
        return comment.insertedId;
    },
};


