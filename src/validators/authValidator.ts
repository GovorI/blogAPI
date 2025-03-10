import { Request, Response, NextFunction } from "express";
import { SETTINGS } from "../settings";

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
  console.log(auth);

  if (!authType || !code || authType.toLowerCase() !== "basic") {
    res.status(401).json({});
    return;
  }

  const adminAuth = utf8ToBase64(ADMIN_AUTH);
  console.log("auth--------" + adminAuth, code);

  if (adminAuth !== code) {
    res.status(401).json({});
    return;
  }

  next();
  return;
};
