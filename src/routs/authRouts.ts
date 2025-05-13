import {
    confirmCodeValidator,
    emailValidator, loginOrEmailValidator,
    loginValidator,
    passwordValidator,
} from "../validators/authValidator";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {Router} from "express";
import {container} from "../compositionRoot";
import {rateLimitMiddlewareCreator} from "../middlewares/rateLimitMiddleware";
import {authJWTMiddlewareCreator} from "../middlewares/authMiddleware";
import {AuthController} from "../controllers/authController";

const authController = container.get<AuthController>(AuthController);

export const authRouter = Router();

authRouter.post(
    "/login",
    rateLimitMiddlewareCreator(5, 10000),
    loginOrEmailValidator,
    passwordValidator,
    inputCheckErrorsMiddleware,
    authController.login.bind(authController)
);
authRouter.get("/me", authJWTMiddlewareCreator(), authController.me.bind(authController));
authRouter.post('/registration', rateLimitMiddlewareCreator(5, 10000),
    loginValidator, passwordValidator, emailValidator, inputCheckErrorsMiddleware, authController.registration.bind(authController))
authRouter.post('/registration-confirmation', rateLimitMiddlewareCreator(5, 10000),
    confirmCodeValidator, inputCheckErrorsMiddleware, authController.confirmation.bind(authController))
authRouter.post('/registration-email-resending', rateLimitMiddlewareCreator(5, 10000),
    emailValidator, inputCheckErrorsMiddleware, authController.emailResending.bind(authController))
authRouter.post('/refresh-token', authController.updateRefreshToken.bind(authController))
authRouter.post('/logout', authController.logout.bind(authController))