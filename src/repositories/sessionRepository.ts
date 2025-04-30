import {ObjectId} from "mongodb";
import {sessionsCollection} from "../db/db_connection";
import {DomainExceptions} from "../helpers/DomainExceptions";

export type createSessionDTO = {
    userId: string,
    deviceId: string,
    iat: Date,
    deviceName: string,
    ip: string,
    exp: Date,
}

export type updateSessionDTO = {
    iat: Date,
    exp: Date,
    ip: string
}


export const sessionRepository = {
    createSession: async (sessionData: createSessionDTO) => {
        return await sessionsCollection.insertOne({
            _id: new ObjectId(),
            userId: sessionData.userId,
            deviceId: sessionData.deviceId,
            iat: sessionData.iat,
            deviceName: sessionData.deviceName,
            ip: sessionData.ip,
            exp: sessionData.exp
        })
    },
    getSessionByDeviceId: async (deviceId: string) => {
        return await sessionsCollection.findOne({deviceId});
    },
    updateSession: async (deviceId: string, updateSession: updateSessionDTO) => {
        return await sessionsCollection.updateOne(
            {deviceId: deviceId},
            {
                $set: {
                    iat: updateSession.iat,
                    exp: updateSession.exp,
                    ip: updateSession.ip
                }
            }
        )
    },
    deleteAllSessionsExceptActive: async (userId: string, activeDeviceId: string) => {
        const sessions = await sessionsCollection.find({userId: userId}).toArray();
        const activeSessionExists = sessions.some(session => {
            return session.deviceId === activeDeviceId
        })
        if (!activeSessionExists) {
            throw new DomainExceptions(404, 'session: session not found')
        }
        const result = await sessionsCollection.deleteMany({
            userId: userId,
            deviceId: {$ne: activeDeviceId},
        })
        return result.deletedCount > 0
    },
    deleteSessionByDeviceId: async (userId: string, device_Id: string) => {
        const sessions = await sessionsCollection.find({userId: userId}).toArray();
        const activeSessionExists = sessions.some(session => {
            return session.deviceId === device_Id
        })
        if (!activeSessionExists) {
            throw new DomainExceptions(404, 'session: session not found')
        }
        const result = await sessionsCollection.deleteOne({
            userId: userId,
            deviceId: device_Id,
        })
        return result.deletedCount > 0
    }
}
