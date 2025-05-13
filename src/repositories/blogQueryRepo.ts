import {ObjectId} from "mongodb";
import {
    blogsCollection,
    blogSchemaDB,
    blogViewModel, IPagination,
} from "../db/db_connection";
import {PaginationParams} from "../helpers/pagination";
import {injectable} from "inversify";
import "reflect-metadata"


@injectable()
export class BlogQueryRepo {
    async getAll({
                     pageNumber,
                     pageSize,
                     sortBy,
                     sortDirection,
                     searchNameTerm,
                 }: PaginationParams): Promise<IPagination<blogViewModel[]>> {
        const filter = searchNameTerm
            ? {name: {$regex: searchNameTerm, $options: "i"}}
            : {};
        const [items, totalCount] = await Promise.all([
            blogsCollection
                .find(filter)
                .sort({[sortBy]: sortDirection})
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
    }

    async getById(id: string) {
        try {
            const result = await blogsCollection.findOne({_id: new ObjectId(id)});

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
    }
}

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
