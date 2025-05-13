import {NextFunction, Request, Response} from "express";
import {injectable} from "inversify";
import {SessionsQueryService} from "../services/sessionsQueryService";
import {SessionsService} from "../services/sessionService";
import "reflect-metadata"


@injectable()
export class SecurityController {
    constructor(protected sessionsQueryService: SessionsQueryService,
                protected sessionsService: SessionsService) {}

    async getActiveSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const session = await this.sessionsQueryService.getActiveSessions(refreshToken)
            res.status(200).json(session);
            return
        } catch (error) {
            next(error)
        }
    }

    async deleteSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const isDeleted = await this.sessionsService.deleteAllSessionsExceptActive(refreshToken)
            if (isDeleted) {
                res.sendStatus(204)
                return
            }
        } catch (error) {
            next(error)
        }
    }

    async deleteSessionByDeviceId(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const deviceId = req.params.id
            const isDeleted = await this.sessionsService.deleteSessionByDeviceId(refreshToken, deviceId)
            if (isDeleted) {
                res.sendStatus(204)
                return
            }
        } catch (error) {
            next(error)
        }
    }
}



