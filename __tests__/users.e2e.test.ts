import { client, runDb, userViewModel } from "../src/db/db_connection";
import { req } from "../src/helpers/test_helpers";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { SETTINGS } from "../src/settings";
import { utf8ToBase64 } from "../src/validators/authValidator";

const USERS = SETTINGS.PATH.USERS;
const AUTH = SETTINGS.PATH.AUTH;

const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

describe(USERS, () => {
  let newUser: userViewModel;

  beforeAll(async () => {
    await runDb();
    await req.delete(`${SETTINGS.PATH.TESTING}`).expect(204);
  });

  afterAll(async () => {
    await client.close();
    console.log("MongoDB connection closed.");
  });

  it("GET users = []", async () => {
    await req.get(USERS).expect({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it(" - POST new user with incorrect data", async () => {
    const res = await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "",
        password: "",
        email: "",
      })
      .expect(400, {
        errorsMessages: [
          { field: "login", message: "login is required" },
          { field: "password", message: "password is required" },
          {
            field: "email",
            message: "email is required",
          },
        ],
      });
  });

  it("+ POST new user with correct data", async () => {
    const res = await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "Ilya",
        password: "1234567",
        email: "email@main.ru",
      })
      .expect(201);

    newUser = res.body;
    console.log("+ POST new user with correct data", newUser);
    expect(newUser).toMatchObject({
      id: expect.any(String),
      login: "Ilya",
      email: "email@main.ru",
      createdAt: expect.any(String),
    });
  });

  it("+ POST login user with correct login", async () => {
    await req
      .post(USERS)
      .send({
        login: "Ilya133188",
        password: "1234567",
        email: "email_my@main.ru",
      })
      .expect(201);

    const res = await req
      .post(`${AUTH}/login`)
      .send({
        loginOrEmail: "Ilya133188",
        password: "1234567",
      })
      .expect(200);
    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
    });
  });

  it("+ POST login user with correct email", async () => {
    await req
      .post(USERS)
      .send({
        login: "Ilya1olol",
        password: "1234567",
        email: "email_my132@main.ru",
      })
      .expect(201);

    const res = await req
      .post(`${AUTH}/login`)
      .send({
        loginOrEmail: "email_my132@main.ru",
        password: "1234567",
      })
      .expect(200);
    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
    });
  });

  it("+ GET login/me", async () => {
    const res = await req
      .post(`${AUTH}/login`)
      .send({
        loginOrEmail: "email_my132@main.ru",
        password: "1234567",
      })
      .expect(200);
    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
    });
    const me = await req
      .get(`${AUTH}/me`)
      .set({ authorization: "Bearer " + res.body.accessToken })
      .expect(200);
    expect(me.body).toMatchObject({
      email: "email_my132@main.ru",
      login: "Ilya1olol",
      userId: expect.any(String),
    });
  });

  it("- POST does not create user with duplicate email", async () => {
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "user1",
        password: "password1",
        email: "duplicate@example.com",
      })
      .expect(201);

    const res = await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "user2",
        password: "password2",
        email: "duplicate@example.com",
      })
      .expect(400);

    expect(res.body).toEqual({
      errorsMessages: [{ field: "User already exists", message: "User already exists" }],
    });
  });

  it("- POST does not create user with duplicate login", async () => {
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "user1313",
        password: "password1",
        email: "email@example.com",
      })
      .expect(201);

    const res = await req
      .set({ authorization: "Basic " + adminBase64 })
      .post(USERS)
      .send({
        login: "user1313",
        password: "password2",
        email: "email1@example.com",
      })
      .expect(400);

    expect(res.body).toEqual({
      errorsMessages: [{ field: "User already exists", message: "User already exists" }],
    });
  });

  it("- DELETE user by incorrect ID", async () => {
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${USERS}/876328`)
      .expect(400);
  });
  it("+ DELETE user by correct ID", async () => {
    console.log(newUser);
    await req
      .set({ authorization: "Basic " + adminBase64 })
      .delete(`${USERS}/${newUser.id}`)
      .expect(204);

    const res = await req
      .set({ authorization: "Basic " + adminBase64 })
      .get(`${USERS}/${newUser.id}`)
      .expect(404);
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
