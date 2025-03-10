import { config } from "dotenv";
config();

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  PATH: {
    BLOGS: "/api/blogs",
    POSTS: "/api/posts",
    TESTING: "/testing",
  },
  ADMIN_AUTH: "admin:qwerty",
};
