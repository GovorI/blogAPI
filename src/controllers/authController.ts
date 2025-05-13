import {NextFunction, Request, Response, Router} from "express";
import {injectable} from "inversify";
import {AuthService} from "../services/authService";
import "reflect-metadata"

@injectable()
export class AuthController {
    constructor(protected authService: AuthService) {
    }
    async login (req: Request, res: Response, next: NextFunction) {
        const userAgent = req.headers["user-agent"] || 'Unknown User Agent'
        const ip = req.ip || 'unknown-ip';
        try {
            const result = await this.authService.login({
                loginOrEmail: req.body.loginOrEmail,
                password: req.body.password,
                userAgent,
                ip
            });
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
        } catch (error) {
            next(error)
        }
    }
    me (req: Request, res: Response, next: NextFunction) {
        try {
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
    }
    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const login = req.body.login;
            const password = req.body.password;
            const email = req.body.email;
            console.log({login, password, email});
            const result = await this.authService.registration({login, password, email})
            if (result) {
                res.sendStatus(204)
                return;
            }
            // res.sendStatus(204)
            // return
        } catch (error) {
            next(error)
        }
    }
    async emailResending(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body.email;
            const isResending = await this.authService.emailResending(email);
            if (isResending) {
                res.sendStatus(204)
                return;
            }
            // res.sendStatus(204)
            // return
        } catch (error) {
            next(error)
        }
    }
    async confirmation(req: Request, res: Response, next: NextFunction) {
        try {
            const confirmCode = req.body.code
            const result = await this.authService.confirmation(confirmCode)
            if (result) {
                res.sendStatus(204)
                return;
            }
        } catch (error) {
            next(error)
        }
    }
    async updateRefreshToken(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies.refreshToken;
        const ip = req.ip || ''
        if (!refreshToken) {
            res.sendStatus(401)
            return;
        }
        try {
            const tokens = await this.authService.updateRefreshToken(refreshToken, ip, next)
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
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return;
            }

            const isDone = await this.authService.logout(refreshToken, next);
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
}


