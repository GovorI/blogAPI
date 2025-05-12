import { userSchemaDB } from "../db/db_connection";

declare global {
  namespace Express {
    export interface Request {
      user: userSchemaDB | null;
    }
  }
}
