import request from "supertest";
import { app } from "../src/app";
import { createUser, loginUser, refreshToken, getDevices, deleteDevice, logoutDevice } from '../src/testHelpers/sessionHelpers'
import {jwtService} from "../src/services/jwtService";
import {client, runDb} from "../src/db/db_connection";

const agent1 = request.agent(app);
const agent2 = request.agent(app);
const agent3 = request.agent(app);
const agent4 = request.agent(app);
const hackerAgent = request.agent(app);

describe("Session Management", () => {
    let server: any;
    let user: any;
    let hacker: any;
    let tokens1: any, tokens2: any, tokens3: any, tokens4: any, hackersTokens: any

    beforeAll(async () => {
        await runDb();
        // Очистка базы данных перед началом тестов
        await request(app).delete("/testing/all-data").expect(204);

        // Создание пользователя
        user = await createUser({
            login: "IlyaG",
            password: "123456",
            email: "email@mail.ru"
        });
        hacker = await createUser({
            login: "hacker",
            password: "123456",
            email: "hacker@mail.ru",
        });
    });

    afterAll(async () => {
        await client.close()
        // await request(app).delete("/testing/all-data").expect(204);
    });

    it("should log in the user 4 times with different user-agents", async () => {
        // Логин с разными user-agent
        tokens1 = await loginUser(agent1, "IlyaG", "123456", "Agent1");
        tokens2 = await loginUser(agent2, "IlyaG", "123456", "Agent2");
        tokens3 = await loginUser(agent3, "IlyaG", "123456", "Agent3");
        tokens4 = await loginUser(agent4, "IlyaG", "123456", "Agent4");
        hackersTokens = await loginUser(hackerAgent, "hacker", "123456", "hacker");

        expect(tokens1.accessToken).toBeDefined();
        expect(tokens2.accessToken).toBeDefined();
        expect(tokens3.accessToken).toBeDefined();
        expect(tokens4.accessToken).toBeDefined();
        expect(hackersTokens.accessToken).toBeDefined();
    });

    it("should return 404, 401, and 403 errors for invalid requests", async () => {
        console.log(tokens1, jwtService.decodeToken(tokens1.accessToken));

        // Проверка на 404 (несуществующий deviceId)
        await agent1.delete(`/security/devices/invalid-device-id`)
            .set("Cookie", `refreshToken=${tokens1.refreshToken}`)
            .expect(404,{
                errorsMessages: [
                    { field: "session", message: "session not found" },
                ]
            });

        // Проверка на 401 (недействительный токен)
        await agent1.get("/security/devices")
            .set("Cookie", `refreshToken=invalid-token`)
            .expect(401,{
                errorsMessages: [
                    { field: "refresh-token", message: "Refresh token invalid" },
                ]
            });
        // Проверка на 403 (попытка удалить чужое устройство)
        await hackerAgent.delete(`/security/devices/${tokens1.deviceId}`)
            .set("Cookie", `refreshToken=${hackersTokens.refreshToken}`)
            .expect(403, {
                errorsMessages: [
                    {field: "forbidden", message: "user not owner session" },
                ]
            });
    });

    it("should update refreshToken for device 1 and verify changes", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const updatedTokens = await refreshToken(agent1, tokens1.refreshToken);

        // Запрос списка устройств
        const devices = await getDevices(agent1, updatedTokens.accessToken);
        expect(devices.length).toBe(4); // Количество устройств не изменилось

        const device1 = devices.find((d: any) => d.deviceId === tokens1.deviceId);
        expect(device1).toBeDefined();
        expect(new Date(device1.lastActiveDate).getTime()/1000).toBeGreaterThan(tokens1.iat); // lastActiveDate обновилась
    });

    it("should delete device 2 and verify its absence in the list", async () => {
        await agent1.delete(`/security/devices/${tokens2.deviceId}`)
            .set("Cookie", `refreshToken=${tokens1.refreshToken}`)
            .expect(204);

        const devices = await getDevices(agent1, tokens1.refreshToken);
        expect(devices.some((d: any) => d.deviceId === tokens2.deviceId)).toBeFalsy();
    });

    it("should log out device 3 and verify its absence in the list", async () => {
        await logoutDevice(agent3, tokens3.refreshToken);

        const devices = await getDevices(agent1, tokens1.accessToken);
        expect(devices.some((d: any) => d.deviceId === tokens3.deviceId)).toBeFalsy(); // Устройство 3 отсутствует
    });

    it("should delete all remaining devices and verify only the current device remains", async () => {
        await agent1.delete("/security/devices")
            .set("Cookie", `refreshToken=${tokens1.refreshToken}`)
            .expect(204);

        const devices = await getDevices(agent1, tokens1.accessToken);
        expect(devices.length).toBe(1); // В списке только текущее устройство
        expect(devices[0].deviceId).toBe(tokens1.deviceId);
    });

    it("should return 429 for more than 5 requests within 10 seconds, and 401 after waiting", async () => {
        const promises = []
        for (let i = 0; i < 5; i++) {
            promises.push(request(app)
                .post("/auth/login")
                .send({ loginOrEmail: "nonexistentUser", password: "password" }))
        }
        await Promise.all(promises)
        await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "nobody", password: "password" })
            .expect(429);

        await new Promise((resolve) => setTimeout(resolve, 10000));

        await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "nobody", password: "password" })
            .expect(401);
    },15000);
});

