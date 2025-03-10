import { blogViewModel, db } from "../src/db/db";
import { AUTH_TYPE, AUTHORIZATION_HEADER, req } from "../helpers/test_helpers";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { SETTINGS } from "../src/settings";
import { utf8ToBase64 } from "../src/validators/authValidator";

export let newBlog: blogViewModel = db.blogs[0];

const APIBLOGS = SETTINGS.PATH.BLOGS;
const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

describe(APIBLOGS, () => {
  beforeAll(async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`).expect(204);
  });

  afterAll(async () => {});

  it("GET blogs = []", async () => {
    await req.get(APIBLOGS).expect([]);
  });

  it("- POST does not create the blog with incorrect data (no name, no description, no websiteUrl)", async function () {
    await req
      .post(APIBLOGS)
      .set({ authorization: "Basic " + adminBase64 })
      .send({ name: "", description: "", websiteUrl: "" })
      .expect(400, {
        errorsMessages: [
          { field: "name", message: "name is required" },
          { field: "description", message: "description is required" },
          {
            field: "websiteUrl",
            message: "websiteUrl is required",
          },
        ],
      });
    console.log(req.auth);
    const res = await req.get(APIBLOGS);
    expect(res.body).toEqual([]);
  });

  it("+ POST new blog with correct data", async () => {
    const res = await req
      .post(APIBLOGS)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        name: "Ilya",
        description: "micro blog",
        websiteUrl: "https://www.insta.com",
      })
      .expect(201);
    newBlog = res.body;
    expect(res.body).toEqual({
      id: expect.any(String),
      name: "Ilya",
      description: "micro blog",
      websiteUrl: "https://www.insta.com",
    });
  });

  it("- GET blog by ID with incorrect id", async () => {
    await req.get(`${APIBLOGS}/1000`).expect(404);
  });
  it("+ GET blog by ID with correct id", async () => {
    console.log(newBlog.id);
    await req.get(`${APIBLOGS}/${newBlog.id}`).expect(200, newBlog);
  });

  it("- PUT blog by ID with incorrect data", async () => {
    await req
      .put(`${APIBLOGS}/${newBlog.id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        name: "VanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanya",
        description: "MACRO blog",
        websiteUrl: "https://www.vk.com",
      })
      .expect(400);

    const res = await req.get(APIBLOGS);
    expect(res.body[0]).toEqual(newBlog);
  });

  it("+ PUT blog by ID with correct data", async () => {
    await req
      .put(`${APIBLOGS}/${newBlog.id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        name: "Vanya",
        description: "MACRO blog",
        websiteUrl: "https://www.vk.com",
      })
      .expect(204);

    const res = await req.get(`${APIBLOGS}`);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      name: "Vanya",
      description: "MACRO blog",
      websiteUrl: "https://www.vk.com",
    });
    newBlog = res.body[0];
    console.log(newBlog + "+ PUT blog by ID with correct data");
  });

  it("- DELETE blog by incorrect ID", async () => {
    console.log(db.blogs);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIBLOGS}/876328`)
      .expect(404);
  });
  it("+ DELETE blog by correct ID", async () => {
    console.log(newBlog);
    await req
      .delete(`${APIBLOGS}/${newBlog.id}`)
      .set({ authorization: "Basic " + adminBase64 });

    const res = await req.get(APIBLOGS);
    expect(res.body.length).toBe(0);
  });
});
