const { MongoClient, ServerApiVersion } = require("mongodb");
import { ObjectId } from "mongodb";
import { SETTINGS } from "../settings";
const mongoUri = SETTINGS.MONGODB;

export const client = new MongoClient(mongoUri);

export type blogSchemaDB = {
  _id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};
export type userSchemaDB = {
  _id: string;
  login: string;
  password: string;
  email: string;
  createdAt: Date;
};

export type postSchemaDB = {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};

export type postViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
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

export type blogsMapWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: blogViewModel[];
};

export type postsMapWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: postViewModel[];
};

type dbType = {
  blogs: Array<blogSchemaDB>;
  posts: Array<postsMapWithPagination>;
};

export type ReadonlyDBType = {
  blogs: Readonly<blogSchemaDB[]>;
  posts: Readonly<postSchemaDB[]>;
  users: Readonly<userSchemaDB[]>;
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
export const blogsCollection = db.collection("blogs");
export const postsCollection = db.collection("posts");
export const usersCollection = db.collection("users");

export const setDB = async (dataset?: Partial<ReadonlyDBType>) => {
  if (!dataset) {
    // если в функцию ничего не передано - то очищаем базу данных
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
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
        createdAt: user.createdAt || new Date().toISOString(),
        _id: new ObjectId(),
      }))
    );
  }
};
