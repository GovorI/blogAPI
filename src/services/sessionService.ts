import {jwtService} from "./jwtService";
import {sessionRepository} from "../repositories/sessionRepository";
import {sessionQueryRepo} from "../repositories/sessionQueryRepo";
import {DomainExceptions} from "../helpers/DomainExceptions";

export const sessionsService = {
    deleteAllSessionsExceptActive: async (refreshToken: string) => {
        const payload = await jwtService.checkToken(refreshToken);
        const userId = payload.userId
        const deviceId = payload.deviceId
        return await sessionRepository.deleteAllSessionsExceptActive(userId, deviceId)
    },
    deleteSessionByDeviceId: async (refreshToken: string, deviceId: string) => {
        // try {
            const payload = await jwtService.checkToken(refreshToken);
            const userId = payload.userId
            if(!userId){
                throw new DomainExceptions(401, 'unauthorized:invalid token')
            }
            return await sessionRepository.deleteSessionByDeviceId(userId, deviceId)
        // } catch (error) {
        //     console.log(error)
        //     return false
        // }
    }
}