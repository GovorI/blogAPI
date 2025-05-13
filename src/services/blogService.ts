import {BlogRepository} from "../repositories/blogRepository";
import {ObjectId} from "mongodb";
import {BlogQueryRepo} from "../repositories/blogQueryRepo";
import {injectable} from "inversify";
import "reflect-metadata"

export type createBlogDTO = {
    name: string;
    description: string;
    websiteUrl: string;
};

@injectable()
export class BlogService {
    constructor(protected blogRepository: BlogRepository,
                protected blogQueryRepo: BlogQueryRepo) {
    }

    async create(blogData: createBlogDTO) {
        const newBlog = {
            _id: new ObjectId(),
            name: blogData.name,
            description: blogData.description,
            websiteUrl: blogData.websiteUrl,
            createdAt: new Date(),
            isMembership: false,
        };
        const result = await this.blogRepository.create(newBlog);
        // console.log("Create Blog --->", result);

        const blog = await this.blogQueryRepo.getById(result!.insertedId.toString());
        // console.log("Created Blog --->", blog);
        return blog;
    }

    async update(blogId: string, newBlogData: createBlogDTO) {
        try {
            const result = await this.blogRepository.update(blogId, newBlogData);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return false;
        }
    }

    async deleteById(id: string) {
        try {
            const result = await this.blogRepository.deleteById(id);
            return result;
        } catch (error) {
            return null;
        }
    }
}
