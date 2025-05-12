import request from "supertest";
import { app } from "../app";
import {utf8ToBase64} from "../validators/authValidator";
import {SETTINGS} from "../settings";
import {jwtService} from "../services/jwtService";

const adminBase64 = utf8ToBase64(SETTINGS.ADMIN_AUTH);

export const createUser = async (userData: any) => {
    const response = await request(app)
        .post("/users")
        .set({ authorization: "Basic " + adminBase64 })
        .send(userData)
        .expect(201);

    return response.body;
};

export const loginUser = async (
    agent: any,
    loginOrEmail: string,
    password: string,
    userAgent: string
) => {
    const response = await agent
        .post("/auth/login")
        .set("User-Agent", userAgent)
        .send({ loginOrEmail: loginOrEmail, password: password })
        .expect(200);
    const decodedToken = jwtService.decodeToken(response.body.accessToken)
    return {
        accessToken: response.body.accessToken,
        refreshToken: response.headers["set-cookie"][0].split(";")[0].split("=")[1],
        deviceId: decodedToken.deviceId,
        iat: decodedToken.iat,
    };
};

export const refreshToken = async (agent: any, refreshToken: string) => {
    const response = await agent
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(200);

    return {
        accessToken: response.body.accessToken,
        refreshToken: response.headers["set-cookie"][0].split(";")[0].split("=")[1],
    };
};

export const getDevices = async (agent: any, refreshToken: string) => {
    const response = await agent
        .get("/security/devices")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(200);

    return response.body;
};

export const deleteDevice = async (
    agent: any,
    accessToken: string,
    deviceId: string
) => {
    return agent
        .delete(`/devices/${deviceId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
};

export const logoutDevice = async (agent: any, refreshToken: string) => {
    return agent
        .post("/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(204);
};