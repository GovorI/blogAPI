import {NextFunction, Request, Response, Router} from "express";
import {
    confirmCodeValidator,
    emailValidator,
    loginOrEmailValidator, loginValidator,
    passwordValidator,
} from "../validators/authValidator";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {authJWTMiddleware} from "../middlewares/authMiddleware";
import {authService} from "../services/authService";

export const authRouter = Router();

const authController = {
    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.login({
                loginOrEmail: req.body.loginOrEmail,
                password: req.body.password,
            });
            console.log(result)
            if (result) {
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 20000
                });
                res.status(200).json({accessToken: result.accessToken});
                return;
            }
            // res.sendStatus(401);
        } catch (error) {
            next(error)
        }
    },
    me: (req: Request, res: Response, next: NextFunction) => {
        try {
            // if (!req.user) {
            //     res.sendStatus(401);
            //     return;
            // }
            const result = {
                email: req.user?.accountData.email,
                login: req.user?.accountData.login,
                userId: req.user?._id,
            };
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error)
            console.log(error);
        }
    },
    registration: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const login = req.body.login;
            const password = req.body.password;
            const email = req.body.email;
            console.log({login, password, email});
            const result = await authService.registration({login, password, email})
            if (result) {
                res.sendStatus(204)
                return;
            }
            // res.status(500).send({massage: 'Failed to send email'})
            // return
        } catch (error) {
            next(error)
        }
    },
    emailResending: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;
            const isResending = await authService.emailResending(email);
            if (isResending) {
                res.sendStatus(204)
                return;
            }
        } catch (error) {
            next(error)
        }
    },
    confirmation: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const confirmCode = req.body.code
            const result = await authService.confirmation(confirmCode)
            if (result) {
                res.sendStatus(204)
                return;
            }
        } catch (error) {
            next(error)
        }
    },
    updateRefreshToken: async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(401)
            return;
        }
        try {
            const tokens = await authService.updateRefreshToken(refreshToken, next)
            console.log(tokens)
            if (tokens) {
                res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true});
                res.status(200).json({accessToken: tokens.accessToken});
                return
            }
            res.sendStatus(401);
            return
        } catch (err) {
            next(err)
        }
    },
    logout: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return;
            }
            const isDone = await authService.logout(refreshToken, next);
            if (isDone) {
                res.sendStatus(204)
                return;
            }
            res.sendStatus(401)
            return
        } catch (err) {
            next(err)
        }
    }


};

authRouter.post(
    "/login",
    loginOrEmailValidator,
    passwordValidator,
    inputCheckErrorsMiddleware,
    authController.login
);
authRouter.get("/me", authJWTMiddleware, authController.me);
authRouter.post('/registration', loginValidator, passwordValidator, emailValidator,
    inputCheckErrorsMiddleware, authController.registration)
authRouter.post('/registration-confirmation', confirmCodeValidator,
    inputCheckErrorsMiddleware, authController.confirmation)
authRouter.post('/registration-email-resending', emailValidator,
    inputCheckErrorsMiddleware, authController.emailResending)
authRouter.post('/refresh-token', authController.updateRefreshToken)
authRouter.post('/logout', authController.logout)
