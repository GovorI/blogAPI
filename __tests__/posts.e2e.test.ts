import { blogViewModel, db, postViewModel } from "../src/db/db";
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

const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

let newBlog: blogViewModel = {
  id: "string",
  name: "Test Blog",
  description: "Test description",
  websiteUrl: "https://test.com",
};

let newPost: postViewModel = db.posts[0];

const APIPOSTS = SETTINGS.PATH.POSTS;

describe(APIPOSTS, () => {
  beforeAll(async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`).expect(204);

    const resBlog = await req
      .post(SETTINGS.PATH.BLOGS)
      .send({
        name: "Test Blog",
        description: "Test description",
        websiteUrl: "https://test.com",
      })
      .set({ authorization: "Basic " + adminBase64 });
    expect(resBlog.status).toBe(201);
    newBlog = resBlog.body;
  });

  afterAll(async () => {});

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
          {
            field: "blogId",
            message: "blogId is required",
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
        blogId: newBlog.id,
        blogName: newBlog.name,
      })
      .expect(201);
    newPost = res.body;
    console.log(newPost);
    expect(res.body).toEqual({
      id: expect.any(String),
      title: "My Blog",
      shortDescription: "Interest blog about my life",
      content: "blabla bla ololo",
      blogId: newBlog.id,
      blogName: newBlog.name,
    });
  });

  it("- GET post by ID with incorrect id", async () => {
    await req.get(`${APIPOSTS}/1000`).expect(404);
  });
  it("+ GET post by ID with correct id", async () => {
    console.log(newPost.id);
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
        blogId: newBlog.id,
      })
      .expect(400);

    const res = await req.get(APIPOSTS);
    expect(res.body[0]).toEqual(newPost);
  });

  it("+ PUT post by ID with correct data", async () => {
    await req
      .put(`${APIPOSTS}/${newPost.id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        id: newPost.id,
        title: "My Blog",
        shortDescription: "Interest blog about my life",
        content: "blabla bla ololo",
        blogId: newBlog.id,
        blogName: newBlog.name,
      })
      .expect(204);

    const res = await req.get(`${APIPOSTS}`);
    expect(res.body[0]).toEqual({
      id: newPost.id,
      title: "My Blog",
      shortDescription: "Interest blog about my life",
      content: "blabla bla ololo",
      blogId: newBlog.id,
      blogName: newBlog.name,
    });
    newPost = res.body[0];
    console.log(newPost + "+ PUT blog by ID with correct data");
  });

  it("- DELETE post by incorrect ID", async () => {
    console.log(db.blogs);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIPOSTS}/876328`)
      .expect(404);
  });
  it("+ DELETE post by correct ID", async () => {
    console.log(newPost);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIPOSTS}/${newPost.id}`);

    const res = await req.get(APIPOSTS);
    expect(res.body.length).toBe(0);
  });
});
