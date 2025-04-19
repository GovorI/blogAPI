import { config } from "dotenv";
config();

export const SETTINGS = {
  PORT: process.env.PORT || 4000,
  MONGODB: process.env.MONGOURL || "mongodb://127.0.0.1:27017/",
  JWT_SECRET: process.env.JWT_SECRET || "123",
  PATH: {
    BLOGS: "/blogs",
    POSTS: "/posts",
    USERS: "/users",
    COMMENTS: "/comments",
    AUTH: "/auth",
    TESTING: "/testing/all-data",
  },
  ADMIN_AUTH: "admin:qwerty",
  EMAIL_AUTH:{
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
  }
};