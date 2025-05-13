import {ObjectId} from "mongodb";
import {
    blogsCollection,
    blogSchemaDB,
} from "../db/db_connection";
import {createBlogDTO} from "../services/blogService";
import {BlogQueryRepo} from "./blogQueryRepo";
import "reflect-metadata"
import {injectable} from "inversify";

@injectable()
export class BlogRepository {
    constructor(protected blogQueryRepo: BlogQueryRepo) {
    }

    async getById(id: string) {
        try {
            const result = await blogsCollection.findOne({_id: new ObjectId(id)});

            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            console.error("Invalid ID format:", error);
            return null;
        }
    }

    async create(blogData: blogSchemaDB) {
        try {
            const result = await blogsCollection.insertOne(blogData);
            console.log("Create Blog --->", result);
            return result;
        } catch (error) {
            return null;
        }
    }

    async update(blogId: string, newBlogData: createBlogDTO) {
        try {
            const result = await blogsCollection.updateOne(
                {_id: new ObjectId(blogId)},
                {
                    $set: {
                        name: newBlogData.name,
                        description: newBlogData.description,
                        websiteUrl: newBlogData.websiteUrl,
                    },
                }
            );
            const res = await this.blogQueryRepo.getById(blogId);
            if (result.matchedCount === 0) {
                return null;
            }
            return res;
        } catch (error) {
            return null;
        }
    }

    async deleteById(id: string) {
        try {
            const result = await blogsCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            return null;
        }
    }
}
