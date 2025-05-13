import {jwtService} from "./jwtService";
import {sessionViewModel} from "../db/db_connection";
import {injectable} from "inversify";
import "reflect-metadata"
import {SessionQueryRepo} from "../repositories/sessionQueryRepo";

@injectable()
export class SessionsQueryService {
    constructor(protected sessionQueryRepo: SessionQueryRepo  ) {
    }
    async getActiveSessions(refreshToken: string): Promise<sessionViewModel[]> {
        const payload = await jwtService.checkToken(refreshToken)
        const userId = payload.userId
        return await this.sessionQueryRepo.getActiveSessions(userId);

    }
}
