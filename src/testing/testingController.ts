import { Router, Request, Response } from "express";
import { setDB } from "../db/db";
import { SETTINGS } from "../settings";

export const testRouter = Router();

const testController = {
  setDB: (req: Request, res: Response) => {
    setDB();
    res.status(204).send("All data is deleted");
  },
};

testRouter.delete(`/all-data`, testController.setDB);
