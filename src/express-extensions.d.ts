import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      errors?: {
        field: string;
        message: string;
      }[];
    }
  }
}
