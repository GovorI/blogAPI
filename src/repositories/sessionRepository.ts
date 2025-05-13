import {ObjectId} from "mongodb";
import {sessionsCollection} from "../db/db_connection";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {injectable} from "inversify";
import "reflect-metadata"

export type createSessionDTO = {
    userId: string,
    deviceId: string,
    iat: number,
    deviceName: string,
    ip: string,
    exp: number,
}

export type updateSessionDTO = {
    iat: number,
    exp: number,
    ip: string
}

@injectable()
export class SessionRepository {
    async createSession(sessionData: createSessionDTO) {
        return await sessionsCollection.insertOne({
            _id: new ObjectId(),
            userId: sessionData.userId,
            deviceId: sessionData.deviceId,
            iat: sessionData.iat,
            deviceName: sessionData.deviceName,
            ip: sessionData.ip,
            exp: sessionData.exp
        })
    }

    async getSessionByDeviceId(deviceId: string) {
        return await sessionsCollection.findOne({deviceId});
    }

    async updateSession(deviceId: string, updateSession: updateSessionDTO) {
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
    }

    async deleteAllSessionsExceptActive(userId: string, activeDeviceId: string) {
        const sessions = await sessionsCollection.find({userId: userId}).toArray();
        const activeSessionExists = sessions.some(session => {
            return session.deviceId === activeDeviceId
        })
        if (!activeSessionExists) {
            throw new DomainExceptions(404, 'session:session not found')
        }
        const result = await sessionsCollection.deleteMany({
            userId: userId,
            deviceId: {$ne: activeDeviceId},
        })
        return result.deletedCount > 0
    }

    async deleteSessionByDeviceId(userId: string, device_Id: string) {
        const session = await sessionsCollection.findOne({deviceId: device_Id})
        if (!session) {
            throw new DomainExceptions(404, 'session:session not found')
        }
        if (session.userId !== userId) {
            throw new DomainExceptions(403, 'forbidden:user not owner session')
        }
        const result = await sessionsCollection.deleteOne({
            userId: userId,
            deviceId: device_Id,
        })
        return result.deletedCount > 0
    }
}
