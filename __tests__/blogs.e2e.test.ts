import { blogViewModel, client, runDb } from "../src/db/db_connection";
import { AUTH_TYPE, AUTHORIZATION_HEADER, req } from "../helpers/test_helpers";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { SETTINGS } from "../src/settings";
import { utf8ToBase64 } from "../src/validators/authValidator";

const APIBLOGS = SETTINGS.PATH.BLOGS;
const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

describe(APIBLOGS, () => {
  let newBlog: blogViewModel;

  beforeAll(async () => {
    await runDb();
    await req.delete(`${SETTINGS.PATH.TESTING}`).expect(204);

    // const resBlog = await req
    //   .post(SETTINGS.PATH.BLOGS)
    //   .send({
    //     name: "Test Blog",
    //     description: "Test description",
    //     websiteUrl: "https://test.com",
    //     isMembership: false,
    //   })
    //   .set({ authorization: "Basic " + adminBase64 });
    // expect(resBlog.status).toBe(201);
    // newBlog = resBlog.body;
  });

  afterAll(async () => {
    await client.close();
  });

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
        isMembership: false,
      })
      .expect(201);

    newBlog = res.body;
    if (!newBlog) {
      throw new Error("newBlog is undefined. Check the previous test.");
    }
    expect(newBlog).toMatchObject({
      _id: expect.any(String),
      name: "Ilya",
      description: "micro blog",
      websiteUrl: "https://www.insta.com",
      isMembership: false,
      createdAt: expect.any(String),
    });
  });

  it("- GET blog by ID with incorrect id", async () => {
    await req.get(`${APIBLOGS}/1000`).expect(404);
  });
  it("+ GET blog by ID with correct id", async () => {
    console.log(newBlog._id);
    await req
      .get(`${APIBLOGS}/${newBlog._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(newBlog);
      });
  });

  it("- PUT blog by ID with incorrect data", async () => {
    await req
      .put(`${APIBLOGS}/${newBlog._id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        name: "VanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanyaVanya",
        description: "MACRO blog",
        websiteUrl: "https://www.vk.com",
        isMembership: false,
      })
      .expect(400);

    const res = await req.get(APIBLOGS);
    expect(res.body[0]).toEqual(newBlog);
  });

  it("+ PUT blog by ID with correct data", async () => {
    await req
      .put(`${APIBLOGS}/${newBlog._id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .send({
        name: "Vanya",
        description: "MACRO blog",
        websiteUrl: "https://www.vk.com",
        isMembership: false,
      })
      .expect(204);

    const res = await req.get(`${APIBLOGS}`);
    expect(res.body[0]).toEqual({
      _id: expect.any(String),
      name: "Vanya",
      description: "MACRO blog",
      websiteUrl: "https://www.vk.com",
      createdAt: expect.any(String),
      isMembership: false,
    });
    newBlog = res.body[0];
    console.log(newBlog + "+ PUT blog by ID with correct data");
  });

  it("- DELETE blog by incorrect ID", async () => {
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${APIBLOGS}/876328`)
      .expect(404);
  });
  it("+ DELETE blog by correct ID", async () => {
    console.log(`${APIBLOGS}/${newBlog._id}`);
    await req
      .delete(`${APIBLOGS}/${newBlog._id}`)
      .set({ authorization: "Basic " + adminBase64 })
      .expect(204);

    await req.get(`${APIBLOGS}/${newBlog._id}`).expect(404);
  });
});
