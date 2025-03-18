const { MongoClient, ServerApiVersion } = require("mongodb");
import { ObjectId } from "mongodb";
import { SETTINGS } from "../settings";
const mongoUri = SETTINGS.MONGODB;

export const client = new MongoClient(mongoUri);

export type blogSchema = {
  _id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type postSchema = {
  _id: string;
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

export type postViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

type dbType = {
  blogs: Array<blogSchema>;
  posts: Array<postViewModel>;
};

export type ReadonlyDBType = {
  blogs: Readonly<blogSchema[]>;
  posts: Readonly<postViewModel[]>;
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

export const setDB = async (dataset?: Partial<ReadonlyDBType>) => {
  if (!dataset) {
    // если в функцию ничего не передано - то очищаем базу данных
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
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
};
