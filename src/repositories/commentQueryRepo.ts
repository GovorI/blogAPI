import { ObjectId } from "mongodb";
import {
    commentSchemaDB,
    commentsCollection,
    commentViewModel,
} from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";
import {DomainExceptions} from "../helpers/DomainExceptions";


type pagingMapDTO = {
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    items: commentSchemaDB[];
};

export const commentQueryRepo = {
    getCommentById: async (id: string): Promise<commentViewModel> => {
        const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
        if(!comment){throw new DomainExceptions(404, "Could not find comment")}
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt.toISOString(),
        };
    },
    getCommentsWithPagination: async (postId: string, {pageNumber, pageSize, sortBy, sortDirection}: PaginationParams )=>{

        const [items,totalCount] = await Promise.all([
            await commentsCollection
                .find({postId: postId})
                .sort({ [sortBy]: sortDirection })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .toArray(),
            await commentsCollection.countDocuments({postId})
        ])
        console.log(items)
        return mapCommentsWithPaging({totalCount, pageNumber, pageSize, items})
    }
};

function mapToViewModel(comment: commentSchemaDB): commentViewModel {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt.toISOString(),
    };
}

function mapCommentsWithPaging({
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
        items: items.map((comment: commentSchemaDB) => {
            return mapToViewModel(comment);
        }),
    };
}