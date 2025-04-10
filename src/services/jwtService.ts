import { userSchemaDB } from "../db/db_connection";
import jwt from "jsonwebtoken";
import { SETTINGS } from "../settings";
import { ObjectId } from "mongodb";
import {DomainExceptions} from "../helpers/DomainExceptions";

export const jwtService = {
  createJwt: async (user: userSchemaDB) => {
    const token = jwt.sign({ userId: user._id }, SETTINGS.JWT_SECRET, {
      expiresIn: "1h",
    });
    return token;
  },
  getUserIdByToken: async (token: string) => {
    try {
      const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);
      return result.userId;
    } catch (error) {
      console.log(error);
      // throw new DomainExceptions(401, "error with jwt");
    }
  },
};
