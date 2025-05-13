import {PostRepository} from "../repositories/postRepository";
import {BlogRepository} from "../repositories/blogRepository";
import {PostQueryRepo} from "../repositories/postQueryRepo";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import "reflect-metadata"

export type createPostDTO = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
};

export type createCommentDTO = {
    postId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: Date;
};

@injectable()
export class PostService {
    constructor(protected blogRepository: BlogRepository,
                protected postRepository: PostRepository,
                protected postQueryRepo: PostQueryRepo,) {
    }

    async create(postData: createPostDTO) {
        const blog = await this.blogRepository.getById(postData.blogId);

        if (!blog) {
            return null;
        }
        const newPost = {
            _id: new ObjectId(),
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogId: postData.blogId,
            blogName: blog.name,
            createdAt: new Date(),
        };

        const result = await this.postRepository.create(newPost);
        return await this.postQueryRepo.getPostById(result!.insertedId.toString());
    }

    async update(postId: string, newPostData: createPostDTO) {
        try {
            const result = await this.postRepository.update(postId, newPostData);
            if (!result) return false;
            return true;
        } catch (error) {
            return null;
        }
    }

    async deleteById(id: string) {
        try {
            const result = await this.postRepository.deleteById(id);
            if (!result) return false;
            return true;
        } catch (error) {
            return null;
        }
    }
}
