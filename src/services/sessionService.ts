import {jwtService} from "./jwtService";
import {sessionRepository} from "../repositories/sessionRepository";

export const sessionsService = {
    deleteAllSessionsExceptActive: async (refreshToken: string) => {
        const payload = await jwtService.checkToken(refreshToken);
        const userId = payload.userId
        const deviceId = payload.deviceId
        console.log("del sessionAll-->",userId, deviceId)
        return await sessionRepository.deleteAllSessionsExceptActive(userId, deviceId)
    },
    deleteSessionByDeviceId: async (refreshToken: string, deviceId: string) => {
        const payload = await jwtService.checkToken(refreshToken);
        const userId = payload.userId
        console.log("del sessionById-->",userId, deviceId)
        return await sessionRepository.deleteSessionByDeviceId(userId, deviceId)
    }
}