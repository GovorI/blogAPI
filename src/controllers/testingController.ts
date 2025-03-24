import { Router, Request, Response } from "express";
import { setDB } from "../db/db_connection";

export const testRouter = Router();

const testController = {
  setDB: (req: Request, res: Response) => {
    setDB();
    res.status(204).send("All data is deleted");
  },
};

testRouter.delete(`/`, testController.setDB);
