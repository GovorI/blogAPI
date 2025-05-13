import {
    authBaseMiddleware,
    emailValidator,
    loginValidator,
    passwordValidator,
    userIdValidator
} from "../validators/authValidator";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {Router} from "express";
import {container} from "../compositionRoot";
import {UserController} from "../controllers/userController";

const userController = container.get<UserController>(UserController);

export const usersRouter = Router();

usersRouter.get("/", userController.getUsers.bind(userController));
usersRouter.post(
    "/",
    authBaseMiddleware,
    loginValidator,
    emailValidator,
    passwordValidator,
    inputCheckErrorsMiddleware,
    userController.createUser.bind(userController)
);
usersRouter.delete(
    "/:id",
    authBaseMiddleware,
    userIdValidator,
    inputCheckErrorsMiddleware,
    userController.deleteUser.bind(userController)
);