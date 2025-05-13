import {jwtService} from "./jwtService";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {injectable} from "inversify";
import {SessionRepository} from "../repositories/sessionRepository";
import "reflect-metadata"

@injectable()
export class SessionsService {
    constructor(protected sessionRepository: SessionRepository) {
    }
    async deleteAllSessionsExceptActive(refreshToken: string) {
        const payload = await jwtService.checkToken(refreshToken);
        const userId = payload.userId
        const deviceId = payload.deviceId
        return await this.sessionRepository.deleteAllSessionsExceptActive(userId, deviceId)
    }

    async deleteSessionByDeviceId(refreshToken: string, deviceId: string) {
        // try {
        const payload = await jwtService.checkToken(refreshToken);
        const userId = payload.userId
        if (!userId) {
            throw new DomainExceptions(401, 'unauthorized:invalid token')
        }
        return await this.sessionRepository.deleteSessionByDeviceId(userId, deviceId)
        // } catch (error) {
        //     console.log(error)
        //     return false
        // }
    }
}