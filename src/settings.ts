import { config } from "dotenv";
config();

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  MONGODB: process.env.MONGOURL || "mongodb://127.0.0.1:27017/",
  PATH: {
    BLOGS: "/blogs",
    POSTS: "/posts",
    TESTING: "/testing/all-data",
  },
  ADMIN_AUTH: "admin:qwerty",
};
