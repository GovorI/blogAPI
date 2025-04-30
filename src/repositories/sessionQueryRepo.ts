import {sessionSchemaDB, sessionsCollection, sessionViewModel} from "../db/db_connection";


export const sessionQueryRepo = {
    getActiveSessions: async (userId: string): Promise<sessionViewModel[]> => {
        const sessions = await sessionsCollection.find({userId: userId}).toArray()
        return sessions.map((session: sessionSchemaDB): sessionViewModel => {
            return {
                ip: session.ip,
                title: session.deviceName,
                lastActiveDate: session.iat.toISOString(),
                deviceId: session.deviceId,
            }
        })
    },
}
