import {sessionSchemaDB, sessionsCollection, sessionViewModel} from "../db/db_connection";


export const sessionQueryRepo = {
    getActiveSessions: async (userId: string): Promise<sessionViewModel[]> => {
        const sessions = await sessionsCollection.find({userId: userId}).toArray()
        return sessions.map((session: sessionSchemaDB): sessionViewModel => {
            return {
                deviceId: session.deviceId,
                ip: session.ip,
                lastActiveDate: new Date(session.iat*1000),
                title: session.deviceName,
            }
        })
    },
}
