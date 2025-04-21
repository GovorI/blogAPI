import { NextFunction, Request, Response } from "express";
import { jwtService } from "../services/jwtService";
import { userService } from "../services/userService";

export const authJWTMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      res.sendStatus(401).send("Authorization header is missing");
      return;
    }
    const token = req.headers.authorization.split(" ")[1];
    const userId = await jwtService.checkToken(token);
    // if (!userId) {
    //   res.sendStatus(401);
    //   return;
    // }
    const user = await userService.getUserById(userId);
    console.log(user);
    if (!user) {
      res.sendStatus(401).send("User not found");
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
    console.log(error);
  }
};
