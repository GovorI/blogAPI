import {NextFunction, Request, Response, Router} from "express";
import { userService } from "../services/userService";
import {
  loginOrEmailValidator,
  passwordValidator,
} from "../validators/authValidator";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { authJWTMiddleware } from "../middlewares/authMiddleware";

export const authRouter = Router();

const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try{
      const result = await userService.login({
        loginOrEmail: req.body.loginOrEmail,
        password: req.body.password,
      });
      if (result) {
        res.status(200).send({accessToken: result});
        return;
      }
      // res.sendStatus(401);
    }catch(error){
      next(error)
    }
  },
  me: (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }
      const result = {
        email: req.user?.email,
        login: req.user?.login,
        userId: req.user?._id,
      };
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};

authRouter.post(
  "/login",
  loginOrEmailValidator,
  passwordValidator,
  inputCheckErrorsMiddleware,
  authController.login
);
authRouter.get("/me", authJWTMiddleware, authController.me);
