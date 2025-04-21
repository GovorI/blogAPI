import {userSchemaDB} from "../db/db_connection";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ObjectId} from "mongodb";
import {DomainExceptions} from "../helpers/DomainExceptions";

export const jwtService = {
    createJwt: async (user: userSchemaDB, lifeTime: string) => {
        return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {
            expiresIn: lifeTime,
        });
    },
    checkToken: async (token: string) => {
        try {
            const result: any =  jwt.verify(token, SETTINGS.JWT_SECRET);
            return result.userId;
        } catch (error) {
            console.log(error);
            if (error instanceof jwt.TokenExpiredError) {
                throw new DomainExceptions(401, "refresh-token:Refresh token expired");
            }
            throw new DomainExceptions(401, "refresh-token:Refresh token invalid");
        }
    },
};
