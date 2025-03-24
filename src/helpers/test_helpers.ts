import { app } from "../app";
import { agent } from "supertest";

export const req = agent(app);

export const AUTHORIZATION_HEADER = "Authorization:";
export const AUTH_TYPE = "Basic ";
