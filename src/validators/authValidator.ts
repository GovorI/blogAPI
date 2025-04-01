import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { SETTINGS } from "../settings";
import { isValidObjectId } from "mongoose";

const ADMIN_AUTH = SETTINGS.ADMIN_AUTH;

function base64ToUtf8(str: string) {
  const buff = Buffer.from(str, "base64");
  const decodedAuth = buff.toString("utf8");
  return decodedAuth;
}

export function utf8ToBase64(str: string) {
  const buff2 = Buffer.from(str, "utf8");
  const codedAuth = buff2.toString("base64");
  return codedAuth;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"]; // 'Basic xxxx'
  if (!authHeader) {
    res.status(401).json({});
    return;
  }

  const auth = authHeader.toString();

  const [authType, code] = auth.trim().split(" ");

  if (!authType || !code || authType.toLowerCase() !== "basic") {
    res.status(401).json({});
    return;
  }

  const adminAuth = utf8ToBase64(ADMIN_AUTH);

  if (adminAuth !== code) {
    res.status(401).json({});
    return;
  }

  next();
  return;
};

export const loginOrEmailValidator = body("loginOrEmail")
  .notEmpty()
  .withMessage("loginOrEmail is required")
  .isString()
  .withMessage("loginOrEmail must be a string")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("login must be between 3 and 10 characters");
export const loginValidator = body("login")
  .notEmpty()
  .withMessage("login is required")
  .isString()
  .withMessage("login must be a string")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("login must be between 3 and 10 characters");
export const passwordValidator = body("password")
  .notEmpty()
  .withMessage("password is required")
  .isString()
  .withMessage("password must be a string")
  .isLength({ min: 6, max: 20 })
  .withMessage("password must be between 6 and 20 characters");
export const emailValidator = body("email")
  .notEmpty()
  .withMessage("email is required")
  .isString()
  .withMessage("email must be a string")
  .isEmail()
  .withMessage("email must be valid");

export const userIdValidator = param("id")
  .notEmpty()
  .isString()
  .withMessage("not string")
  .trim()
  // .isMongoId();
  .custom((id) => {
    if (!isValidObjectId(id)) throw new Error("Invalid Id format");
    return true;
  })
  .withMessage("Provided ID is not valid");
