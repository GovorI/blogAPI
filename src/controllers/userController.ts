import {NextFunction, Request, Response, Router} from "express";
import { userService } from "../services/userService";
import { userQueryRepo } from "../repositories/userQueryRepo";
import {
  authBaseMiddleware,
  emailValidator,
  loginValidator,
  passwordValidator,
  userIdValidator,
} from "../validators/authValidator";
import { inputCheckErrorsMiddleware } from "../validators/inputCheckErrorsMiddleware";
import { paginationQueries } from "../helpers/pagination";

export const usersRouter = Router();

const userController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
        searchEmailTerm,
      } = paginationQueries(req);
      const users = await userQueryRepo.getUsers({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
        searchEmailTerm,
      });
      res.status(200).send(users);
      return
    } catch (error) {
      throw new Error("Internal server error");
    }
  },
  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { login, password, email } = req.body;
      const userId = await userService.createUser({ login, password, email, isConfirmed: true });
      const user = await userQueryRepo.getUserById(userId);
      console.log("userController.createUser---->", userId);
      res.status(201).send(user);
      return
    } catch (error) {
      next(error);
    }
  },
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedUser = await userService.deleteUser(req.params.id);
      if (deletedUser) {
        res.sendStatus(204);
        return;
      }
      res.sendStatus(404);
      return;
    } catch (error) {
      next(error)
    }
  },
};

usersRouter.get("/", userController.getUsers);
usersRouter.post(
  "/",
  authBaseMiddleware,
  loginValidator,
  emailValidator,
  passwordValidator,
  inputCheckErrorsMiddleware,
  userController.createUser
);
usersRouter.delete(
  "/:id",
  authBaseMiddleware,
  userIdValidator,
  inputCheckErrorsMiddleware,
  userController.deleteUser
);
