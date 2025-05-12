import {client, runDb, userSchemaDB, userViewModel} from "../src/db/db_connection";
import {req} from "../src/helpers/test_helpers";
import {afterAll, beforeAll, describe, expect, it} from "@jest/globals";
import {SETTINGS} from "../src/settings";
import {utf8ToBase64} from "../src/validators/authValidator";
import {userRepository} from "../src/repositories/userRepository";
import {DomainExceptions} from "../src/helpers/DomainExceptions";

const USERS = SETTINGS.PATH.USERS;
const AUTH = SETTINGS.PATH.AUTH;
const AUTH_REGISTRATION = `${AUTH}/registration`
const AUTH_REGISTRATION_EMAIL_RESENDING = `${AUTH}/registration-email-resending`
const AUTH_CONFIRM = `${AUTH}/registration-confirmation`
const LOGIN = SETTINGS.PATH.LOGIN;


const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

describe(AUTH, () => {
    let newUser: userSchemaDB;

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

    it(" - POST registration new user with incorrect data", async () => {
        const res = await req
            .post(AUTH_REGISTRATION)
            .send({
                login: "",
                password: "",
                email: "",
            })
            .expect(400, {
                errorsMessages: [
                    {field: "login", message: "login is required"},
                    {field: "password", message: "password is required"},
                    {field: "email", message: "email is required"},
                ],
            });
    });

    it("+ POST registration new user with correct data", async () => {
        const res = await req
            .post(AUTH_REGISTRATION)
            .send({
                login: "Ilya",
                password: "1234567",
                email: "govorip@gmail.com",
            })
            .expect(204);
        let result = await userRepository.getUserByEmail("govorip@gmail.com");
        if (!result) {
            console.log("create user -------->", result)
            throw new DomainExceptions(404, "email:User with this email not found");
        }
        expect(result).toMatchObject({
            accountData: {
                login: "Ilya",
                password: expect.any(String),
                email: "govorip@gmail.com",
                createdAt: expect.any(Date),
            },
            emailConfirmation: {
                confirmCode: expect.any(String),
                expirationDate: expect.any(Date),
                isConfirmed: false
            }
        })
        newUser = result;
        console.log("+ POST registration new user with correct data", newUser);
    });

    it("+ POST registration new user with correct data", async () => {
        const res = await req
            .post(AUTH_REGISTRATION)
            .send({
                login: "Ilya",
                password: "1234567",
                email: "govorip@gmail.com",
            })
            .expect(204);
        let result = await userRepository.getUserByEmail("govorip@gmail.com");
        if (!result) {
            console.log("create user -------->", result)
            throw new DomainExceptions(404, "email:User with this email not found");
        }
        expect(result).toMatchObject({
            accountData: {
                login: "Ilya",
                password: expect.any(String),
                email: "govorip@gmail.com",
                createdAt: expect.any(Date),
            },
            emailConfirmation: {
                confirmCode: expect.any(String),
                expirationDate: expect.any(Date),
                isConfirmed: false
            }
        })
        newUser = result;
        console.log("+ POST registration new user with correct data", newUser);
    });

    it.skip("+ POST resend email with new code if user exists but not confirmed yet", async () => {
        await req
            .post(AUTH_REGISTRATION_EMAIL_RESENDING)
            .send({
                email: "govorip@gmail.com",
            })
            .expect(204);
        const user = await userRepository.getUserByEmail("govorip@gmail.com");
        newUser.emailConfirmation.confirmCode = user!.emailConfirmation.confirmCode;
    });

    it.skip("+ POST confirm email with correct code", async () => {
        await req
            .post(AUTH_CONFIRM)
            .send({
                code: newUser.emailConfirmation.confirmCode,
            })
            .expect(204);
        const user = await userRepository.getUserByConfirmCode(newUser.emailConfirmation.confirmCode);
        expect(user).toMatchObject({
            emailConfirmation: {
                isConfirmed: true
            }
        })
    });

    it.skip("+ POST dont confirm with confirmed email", async () => {
        await req
            .post(AUTH_CONFIRM)
            .send({
                code: newUser.emailConfirmation.confirmCode,
            })
            .expect(400, {
                errorsMessages: [{
                    field: "code",
                    message: "email already confirmed",
                }]
            });
    });

    it("+ POST doesnt resend email for confirmed user", async () => {
        await req
            .post(AUTH_REGISTRATION_EMAIL_RESENDING)
            .send({
                email: "govorip@gmail.com",
            })
            .expect(400, {
                errorsMessages: [
                    {field: "email", message: "email already confirmed"},
                ]
            });
    });

    it("+ POST resending email for unexisting user", async () => {
        await req
            .post(AUTH_REGISTRATION_EMAIL_RESENDING)
            .send({
                email: "govorip3@gmail.com",
            })
            .expect(400, {
                errorsMessages: [
                    {field: "email", message: "User with this email not found"},
                ]
            });
    });

    it("+ POST confirm email with unexisting code", async () => {
        await req
            .post(AUTH_CONFIRM)
            .send({
                code: 'sdflkjslkdfjlksjf',
            })
            .expect(400, {
                errorsMessages: [
                    {field: "code", message: "code doesnt exist"},
                ]
            });
    });

    it("+ GET login/me", async () => {
        const res = await req
            .post(`${AUTH}/login`)
            .send({
                loginOrEmail: "govorip@gmail.com",
                password: "1234567",
            })
            .expect(200);
        expect(res.body).toMatchObject({
            accessToken: expect.any(String),
        });
        const me = await req
            .get(`${AUTH}/me`)
            .set({authorization: "Bearer " + res.body.accessToken})
            .expect(200);
        expect(me.body).toMatchObject({
            email: "govorip@gmail.com",
            login: "Ilya",
            userId: expect.any(String),
        });
    });

    it("- POST does not create user with duplicate email", async () => {
        const res = await req
            .post(AUTH_REGISTRATION)
            .send({
                login: "user2",
                password: "password2",
                email: "govorip@gmail.com",
            })
            .expect(400);

        expect(res.body).toEqual({
            errorsMessages: [{field: "email", message: "Email already exists"}],
        });
    });

    it("- POST does not create user with duplicate login", async () => {
        const res = await req
            .post(AUTH_REGISTRATION)
            .send({
                login: "Ilya",
                password: "password2",
                email: "govorip2@gmail.com",
            })
            .expect(400);

        expect(res.body).toEqual({
            errorsMessages: [{field: "login", message: "Login already exists"}],
        });
    });

    // it("- DELETE user by incorrect ID", async () => {
    //   await req
    //     .set({ authorization: "Basic " + adminBase64 })
    //     .delete(`${USERS}/876328`)
    //     .expect(400);
    // });
    // it("+ DELETE user by correct ID", async () => {
    //   console.log(newUser);
    //   await req
    //     .set({ authorization: "Basic " + adminBase64 })
    //     .delete(`${USERS}/${newUser.id}`)
    //     .expect(204);
    //
    //   const res = await req
    //     .set({ authorization: "Basic " + adminBase64 })
    //     .get(`${USERS}/${newUser.id}`)
    //     .expect(404);
    // });

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
