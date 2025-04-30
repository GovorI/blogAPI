import {NextFunction, Request, Response, Router} from "express";
import {sessionsQueryService} from "../services/sessionsQueryService";
import {sessionsService} from "../services/sessionService";


export const securityRouter = Router();

const securityController = {
    getActiveSessions: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const session = await sessionsQueryService.getActiveSessions(refreshToken)
            res.status(200).json(session);
            return
        } catch (error) {
            next(error)
        }
    },
    deleteSessions: async (req: Request, res: Response, next: NextFunction) => {
        try{
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const isDeleted = await sessionsService.deleteAllSessionsExceptActive(refreshToken)
            if(isDeleted) {
                res.sendStatus(204)
                return
            }
        }catch (error) {
            next(error)
        }
    },
    deleteSessionByDeviceId: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log(refreshToken);
            if (!refreshToken) {
                res.sendStatus(401)
                return
            }
            const deviceId = req.params.id
            console.log(deviceId)
            const isDeleted = await sessionsService.deleteSessionByDeviceId(refreshToken, deviceId)
            if(isDeleted) {
                res.sendStatus(204)
                return
            }
        }catch (error) {
            next(error)
        }
    }
};

securityRouter.get(
    "/devices",
    securityController.getActiveSessions
);
securityRouter.delete(
    "/devices",
    securityController.deleteSessions
);
securityRouter.delete(
    "/devices/:id",
    securityController.deleteSessionByDeviceId
);

