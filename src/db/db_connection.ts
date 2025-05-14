import {Collection, MongoClient, ObjectId} from "mongodb";
import {SETTINGS} from "../settings";
import {uuid} from "uuidv4";
import dateFn from "date-fns";

const mongoUri = SETTINGS.MONGODB;

export const client = new MongoClient(mongoUri);

export type blogSchemaDB = {
    _id: ObjectId;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: boolean;
};
export type userSchemaDB = {
    _id: ObjectId;
    accountData: {
        login: string;
        password: string;
        email: string;
        createdAt: Date;
    },
    emailConfirmation: {
        confirmCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    },
    recoveryPassword?: {
        recoveryPasswordCode: string;
        expirationDate: Date,
    }
};

export type updateUserCodeConfirmByEmail = {
    confirmCode: string;
    expirationDate: Date;
}

export type recoveryPasswordData = {
    recoveryPasswordCode: string;
    expirationDate: Date;
}

export type postSchemaDB = {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
};
export type commentSchemaDB = {
    _id: ObjectId;
    postId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: Date;
};

export type sessionSchemaDB = {
    _id: ObjectId;
    userId: string;
    deviceId: string;
    iat: number;
    deviceName: string;
    ip: string;
    exp: number;
}

export type sessionViewModel = {
    deviceId: string;
    lastActiveDate: Date;
    ip: string;
    title: string;
}

export type postViewModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
};

type commentatorInfo = {
    userId: string;
    userLogin: string;
};

export type commentViewModel = {
    id: string;
    content: string;
    commentatorInfo: commentatorInfo;
    createdAt: string;
};

export type blogViewModel = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
};

export type userViewModel = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};

export interface IPagination<I> {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: I
}

type dbType = {
    blogs: Array<blogSchemaDB>;
    posts: Array<postSchemaDB>;
};

export type ReadonlyDBType = {
    blogs: Readonly<blogSchemaDB[]>;
    posts: Readonly<postSchemaDB[]>;
    users: Readonly<userSchemaDB[]>;
    comments: Readonly<commentSchemaDB[]>;
    sessions: Readonly<sessionSchemaDB[]>;
};

export async function runDb() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
    } catch (e) {
        console.log("Can not connect to mongo server", e);
        process.exit(1);
    }
}

const db = client.db("blog-api");
export const blogsCollection: Collection<blogSchemaDB> = db.collection("blogs");
export const postsCollection: Collection<postSchemaDB> = db.collection("posts");
export const usersCollection: Collection<userSchemaDB> = db.collection("users");
export const commentsCollection: Collection<commentSchemaDB> = db.collection("comments");
export const sessionsCollection: Collection<sessionSchemaDB> = db.collection("sessions");

export const setDB = async (dataset?: Partial<ReadonlyDBType>) => {
    if (!dataset) {
        // если в функцию ничего не передано - то очищаем базу данных
        await blogsCollection.deleteMany({});
        await postsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await commentsCollection.deleteMany({});
        await sessionsCollection.deleteMany({});
        return;
    }

    // если что-то передано - то заменяем старые значения новыми,
    // не ссылки - а глубокое копирование, чтобы не изменять dataset
    if (dataset.blogs) {
        await db.collection("blogs").deleteMany({});
        await db.collection("blogs").insertMany(
            dataset.blogs.map((blog) => ({
                ...blog,
                createdAt: blog.createdAt || new Date().toISOString(),
                _id: new ObjectId(),
            }))
        );
    }
    if (dataset.posts) {
        await db.collection("posts").deleteMany({});
        await db.collection("posts").insertMany(
            dataset.posts.map((post) => ({
                ...post,
                createdAt: post.createdAt || new Date().toISOString(),
                _id: new ObjectId(),
                blogId: new ObjectId(post.blogId),
            }))
        );
    }
    if (dataset.users) {
        await db.collection("users").deleteMany({});
        await db.collection("users").insertMany(
            dataset.users.map((user) => ({
                ...user,
                createdAt: user.accountData.createdAt || new Date().toISOString(),
                _id: new ObjectId(),
            }))
        );
    }
    if (dataset.comments) {
        await db.collection("comments").deleteMany({});
        await db.collection("comments").insertMany(
            dataset.comments.map((comment) => ({
                ...comment,
                createdAt: comment.createdAt || new Date().toISOString(),
                _id: new ObjectId(),
            }))
        );
    }
    if (dataset.sessions) {
        await db.collection("comments").deleteMany({});
        await db.collection("comments").insertMany(
            dataset.sessions.map((session) => ({
                ...session,
                _id: new ObjectId(),
            }))
        );
    }
};
