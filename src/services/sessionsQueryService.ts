import {jwtService} from "./jwtService";
import {sessionQueryRepo} from "../repositories/sessionQueryRepo";
import {sessionViewModel} from "../db/db_connection";
import {DomainExceptions} from "../helpers/DomainExceptions";

export const sessionsQueryService = {
    getActiveSessions: async (refreshToken: string): Promise<sessionViewModel[]> => {
        const payload = await jwtService.checkToken(refreshToken)
        // if(!payload){
        //     throw new DomainExceptions(401, 'token:token is missing')
        // }
        const userId = payload.userId
        return await sessionQueryRepo.getActiveSessions(userId);

    }
};
