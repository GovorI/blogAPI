import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {SignOptions} from "jsonwebtoken";

type decodedToken = {
    userId: string;
    deviceId: string;
    iat: number;
    exp: number;
}

export const jwtService = {
    createJwt: async (userId: string, deviceId: string, lifeTime: string) => {
        return jwt.sign({userId, deviceId}, SETTINGS.JWT_SECRET, {
            expiresIn: lifeTime
        } as SignOptions);
    },
    checkToken: async (token: string) => {
        try {
            const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);
            return result;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new DomainExceptions(401, "refresh-token:Refresh token expired");
            }
            throw new DomainExceptions(401, "refresh-token:Refresh token invalid");
        }
    },
    decodeToken: (token: string) => {
        return jwt.decode(token) as decodedToken;
    }
};
