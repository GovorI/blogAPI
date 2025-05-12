import {blogViewModel, client, commentViewModel, postViewModel, runDb, userViewModel} from "../src/db/db_connection";
import { req } from "../src/helpers/test_helpers";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { SETTINGS } from "../src/settings";
import { utf8ToBase64 } from "../src/validators/authValidator";

const COMMENTS = SETTINGS.PATH.COMMENTS;
const USERS = SETTINGS.PATH.USERS;
const AUTH = SETTINGS.PATH.AUTH;
const APIPOSTS = SETTINGS.PATH.POSTS
const APIBLOGS = SETTINGS.PATH.BLOGS

const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

describe(COMMENTS, () => {
  let newComment: commentViewModel;
  let User: userViewModel;
  let newBlog: blogViewModel
    let newPost: postViewModel
  let accessToken: string;

  beforeAll(async () => {
    await runDb();
    await req.delete(`${SETTINGS.PATH.TESTING}`).expect(204);
    const user = await req.post(USERS)
        .set({ authorization: "Basic " + adminBase64 })
        .send({ login: "Ilya", password: "1234567", email: 'tut@tut.by' })
        .expect(201)
      User = user.body
      console.log(User)
      const auth = await req
          .post(`${AUTH}/login`)
          .send({
              loginOrEmail: "tut@tut.by",
              password: "1234567",
          })
          .expect(200);
    accessToken = auth.body.accessToken;
    console.log(accessToken);
      const blog = await req
          .post(APIBLOGS)
          .set({ authorization: "Basic " + adminBase64 })
          .send({
              name: "Ilya",
              description: "micro blog",
              websiteUrl: "https://www.insta.com",
              isMembership: false,
          })
          .expect(201);

      newBlog = blog.body;
      console.log(newBlog);
      if (!newBlog) {
          throw new Error("newBlog is undefined. Check the previous test.");
      }
      expect(newBlog).toMatchObject({
          id: expect.any(String),
          name: "Ilya",
          description: "micro blog",
          websiteUrl: "https://www.insta.com",
          isMembership: false,
          createdAt: expect.any(String),
      });
      const post = await req
          .post(APIPOSTS)
          .set({ authorization: "Basic " + adminBase64 })
          .send({
              title: "My Blog",
              shortDescription: "Interest blog about my life",
              content: "blabla bla ololo",
              blogId: newBlog.id.toString(),
              blogName: newBlog.name.toString(),
          })
          .expect(201);
      newPost = post.body;
      console.log(newPost);
      if (!newPost) {
          throw new Error("newPost is undefined. Check the previous test.");
      }
      console.log("Created post:", newPost);
      expect(post.body).toMatchObject({
          id: expect.any(String),
          title: "My Blog",
          shortDescription: "Interest blog about my life",
          content: "blabla bla ololo",
          blogId: newBlog.id.toString(),
          blogName: newBlog.name,
          createdAt: expect.any(String),
      });
  });

  afterAll(async () => {
    await client.close();
    console.log("MongoDB connection closed.");
  });

  it("GET COMMENTS = []", async () => {
      console.log(newPost.id)
    await req.get( `/posts/${newPost.id}/comments`).expect({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(" - POST new COMMENT with incorrect data", async () => {
    const res = await req
      .set({ authorization: "Bearer "+accessToken })
      .post(`/posts/${newPost.id}/comments`)
      .send({
        content: 'o'.repeat(301),
      })
      .expect(400, {
        errorsMessages: [
          { field: "content", message: "Content must be min 20 max 300 characters" },
        ],
      });
  });

  it("+ POST new COMMENT with correct data", async () => {
    const res = await req
      .set({ authorization: "Bearer "+accessToken })
      .post(`/posts/${newPost.id}/comments`)
      .send({
        content: "Comment for test. Must be created",
      })
      .expect(201);

    newComment = res.body;
    console.log("+ POST new user with correct data", newComment);
    expect(newComment).toMatchObject({
        id: expect.any(String),
        content: "Comment for test. Must be created",
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
    });
  });

  it("- DELETE COMMENT by incorrect ID", async () => {
    await req
      .set({ authorization: "Bearer "+accessToken})
      .delete(`${COMMENTS}/876328`)
      .expect(400);
  });

  it("+ DELETE COMMENT by correct ID", async () => {
    console.log(newComment);
    await req
      .set({ authorization: "Bearer " + accessToken})
      .delete(`${COMMENTS}/${newComment.id}`)
      .expect(204);

    // const res = await req
    //   .get(`${COMMENTS}/${newComment.id}`)
    //   .expect(404);
  });

  // it("should return filtered users with pagination", async () => {
  //   const queryParams =
  //     "pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.com&sortDirection=asc&sortBy=login";
  //   const res = await req.get(`/users?${queryParams}`).expect(200);

  //   expect(res.body).toEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 15,
  //     totalCount: 9,
  //     items: [
  //       {
  //         id: expect.any(String),
  //         login: "loSer",
  //         email: "email2p@gg.om",
  //         createdAt: expect.any(String),
  //       },
  //       {
  //         id: expect.any(String),
  //         login: "user01",
  //         email: "email1p@gg.cm",
  //         createdAt: expect.any(String),
  //       },
  //     ],
  //   });
  // });
});
