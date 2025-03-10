import { config } from "dotenv";
config();

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  PATH: {
    BLOGS: "/blogs",
    POSTS: "/posts",
    TESTING: "/testing/all-data",
  },
  ADMIN_AUTH: "admin:qwerty",
};
