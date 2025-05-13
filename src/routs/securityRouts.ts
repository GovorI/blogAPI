import {Router} from "express";
import {container} from "../compositionRoot";
import {SecurityController} from "../controllers/securityController";

const securityController = container.get<SecurityController>(SecurityController)
export const securityRouter = Router();

securityRouter.get(
    "/devices",
    securityController.getActiveSessions.bind(securityController)
);
securityRouter.delete(
    "/devices",
    securityController.deleteSessions.bind(securityController)
);
securityRouter.delete(
    "/devices/:id",
    securityController.deleteSessionByDeviceId.bind(securityController)
);