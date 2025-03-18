import {
  blogViewModel,
  client,
  postViewModel,
  runDb,
} from "../src/db/db_connection";
import { req } from "../helpers/test_helpers";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { SETTINGS } from "../src/settings";
import { utf8ToBase64 } from "../src/validators/authValidator";

// {
//   "title": "string",
//   "shortDescription": "string",
//   "content": "string",
//   "blogId": "string"
// }
const APIPOSTS = SETTINGS.PATH.POSTS;
describe(`${APIPOSTS}`, () => {
  const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

  let newBlog: blogViewModel;
  let newPost: postViewModel;

  beforeAll(async () => {
    await runDb();

    await req.delete(`${SETTINGS.PATH.TESTING}`).expect(204);

    const resBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .send({
        name: "Test Blog",
        description: "Test description",
        websiteUrl: "https://test.com",
        isMembership: false,
      })
      .set({ authorization: "Basic " + adminBase64 });
    expect(resBlog.status).toBe(201);
    newBlog = resBlog.body;
    console.log("Created newBlog for test Posts --------> ", newBlog);
  });

  afterAll(async () => {
    await client.close();
  });

  it("GET posts = []", async () => {
    await req.get(APIPOSTS).expect([]);
  });

  it("- POST does not create the post with incorrect data (no title, no shortDescription, no content, no blogId)", async function () {
    await req
      .post(APIPOSTS)
      .set({ authorization: "Basic " + adminBase64 })
      .send({ title: "", shortDescription: "", content: "", blogId: "" })
      .expect(400, {
        errorsMessages: [
          { field: "title", message: "title is required" },
          {
            field: "shortDescription",
            message: "shortDescription is required",
          },
          {
            field: "content",
            message: "content is required",
          },
        ],
      });

    const res = await req.get(APIPOSTS);
    expect(res.body).toEqual([]);
  });

  it("+ POST new post with correct data", async () => {
    const res = await req
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
    newPost = res.body;
    if (!newPost) {
      throw new Error("newPost is undefined. Check the previous test.");
    }
    console.log("Created post:", newPost);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      title: "My Blog",
      shortDescription: "Interest blog about my life",
      content: "blabla bla ololo",
      blogId: newBlog.id.toString(),
      blogName: newBlog.name,
      createdAt: expect.any(String),
    });
  });

  it("- GET post by ID with incorrect id", async () => {
    await req.get(`${APIPOSTS}/1000`).expect(404);
  });
  it("+ GET post by ID with correct id", async () => {
    await req.get(`${APIPOSTS}/${newPost.id}`).expect(200, newPost);
  });

  it("- PUT post by ID with incorrect data", async () => {
    await req
      .put(`${APIPOSTS}/${newPost.id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        title: `My BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy 
          BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy 
          BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy
           BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy BlogMy Blog`,
        shortDescription: 42,
        content: 3.14,
        blogId: newBlog.id.toString(),
      })
      .expect(400);

    const res = await req.get(APIPOSTS);
    expect(res.body[0]).toEqual(newPost);
  });

  it("+ PUT post by ID with correct data", async () => {
    await req
      .put(`${APIPOSTS}/${newPost.id.toString()}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        title: "My Blog",
        shortDescription: "Interest blog about my life",
        content: "blabla bla ololo lol",
        blogId: newBlog.id.toString(),
        blogName: newBlog.name,
      })
      .expect(204);

    const res = await req.get(`${APIPOSTS}`);
    expect(res.body[0]).toEqual({
      id: newPost.id.toString(),
      title: "My Blog",
      shortDescription: "Interest blog about my life",
      content: "blabla bla ololo lol",
      blogId: newBlog.id,
      blogName: newBlog.name,
      createdAt: expect.any(String),
    });
    newPost = res.body[0];
  });

  it("- DELETE post by incorrect ID", async () => {
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIPOSTS}/876328`)
      .expect(400);
  });
  it("+ DELETE post by correct ID", async () => {
    console.log(newPost);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIPOSTS}/${newPost.id}`)
      .expect(204);

    const res = await req.get(APIPOSTS);
    expect(res.body.length).toBe(0);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIPOSTS}/${newPost.id}`)
      .expect(404);
  });
});
