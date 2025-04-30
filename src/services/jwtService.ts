import {userSchemaDB} from "../db/db_connection";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {DomainExceptions} from "../helpers/DomainExceptions";

export const jwtService = {
    createJwt: async (user: userSchemaDB, deviceId: string, lifeTime: string) => {
        return jwt.sign({userId: user._id, deviceId}, SETTINGS.JWT_SECRET, {
            expiresIn: lifeTime,
        });
    },
    checkToken: async (token: string) => {
        try {
            const result: any =  jwt.verify(token, SETTINGS.JWT_SECRET);
            return result;
        } catch (error) {
            console.log(error);
            if (error instanceof jwt.TokenExpiredError) {
                throw new DomainExceptions(401, "refresh-token:Refresh token expired");
            }
            throw new DomainExceptions(401, "refresh-token:Refresh token invalid");
        }
    },
};
