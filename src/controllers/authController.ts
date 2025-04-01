import { Request, Response, Router } from "express";
import { userService } from "../services/userService";
import {
  loginOrEmailValidator,
  passwordValidator,
} from "../validators/authValidator";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";

export const authRouter = Router();

const authController = {
  login: async (req: Request, res: Response) => {
    const result = await userService.login({
      loginOrEmail: req.body.loginOrEmail,
      password: req.body.password,
    });
    if (result) {
      res.sendStatus(204);
      return;
    }
    res.sendStatus(401);
  },
};

authRouter.post(
  "/login",
  loginOrEmailValidator,
  passwordValidator,
  inputCheckErrorsMiddleware,
  authController.login
);
