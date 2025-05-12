import bcrypt from "bcrypt";
import {uuid} from "uuidv4";
import dateFn from 'date-fns'
import {userRepository} from "../repositories/userRepository";
import {jwtService} from "./jwtService";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {userService} from "./userService";
import {emailForm, sendEmail} from "./nodemailer.service";
import {NextFunction} from "express";
import {sessionRepository} from "../repositories/sessionRepository";
import {sessionsService} from "./sessionService";

type authUserDTO = {
    loginOrEmail: string;
    password: string;
    userAgent: string;
    ip: string;
};

type registrationDTO = {
    login: string;
    password: string;
    email: string;
}

export const authService = {
    login: async (authData: authUserDTO) => {
        const user = await userRepository.getUserByLoginOrEmail(
            authData.loginOrEmail
        );
        if (!user) {
            throw new DomainExceptions(401, "wrong login or password")
        }
        const isCredentials = await bcrypt.compare(
            authData.password,
            user.accountData.password
        );
        if (!isCredentials) {
            throw new DomainExceptions(401, "wrong login or password")
        }
        const deviceId = uuid()
        const [accessToken, refreshToken] = await Promise.all([
            jwtService.createJwt(user._id.toString(), deviceId, "10s"),
            jwtService.createJwt(user._id.toString(), deviceId, "20s"), //сделать отдельн создание
        ])
        const token = jwtService.decodeToken(refreshToken)
        await sessionRepository.createSession({
            userId: user._id.toString(),
            deviceId: deviceId,
            iat: token.iat,
            deviceName: authData.userAgent,
            ip: authData.ip,
            exp: token.exp //из токена
        })
        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    },
    registration: async (userData: registrationDTO) => {
        console.log("authService", userData);
        const createdUserId = await userService.createUser(userData);
        if (!createdUserId) {
            throw new DomainExceptions(500, "user:does not create user")
        }
        const user = await userService.getUserById(createdUserId);
        const confirmCode = user!.emailConfirmation.confirmCode
        const isSendEmail = await sendEmail(userData.email, confirmCode, emailForm.registrationEmail);
        console.log(isSendEmail);
        if (!isSendEmail) {
            await userRepository.deleteUser(createdUserId);
            throw new DomainExceptions(500, "email:does not send email")
        }
        return true;
    },
    emailResending: async (email: string) => {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            // throw new DomainExceptions(400, 'email:User with this email not found')
            return true
        }
        if (user.emailConfirmation.isConfirmed) {
            // throw new DomainExceptions(400, "email:email already confirmed")
            return true
        }
        const confirmCode = uuid()
        try {
            const isSendEmail = await sendEmail(email, confirmCode, emailForm.registrationEmail);
            if (isSendEmail) {
                const newUserData = {
                    confirmCode: confirmCode,
                    expirationDate: dateFn.add(new Date(), {
                        hours: 1
                    }),
                    // isConfirmed: false
                }
                const res = await userRepository.updateUserCodeConfirmByEmail(email, newUserData)
                console.log(res)
                return true
            }
            return false
        } catch (e) {
            console.log("failed to send email", e)
            throw new DomainExceptions(500, "email:failed to send email");
            // return false;
        }

    },
    confirmation: async (confirmCode: string) => {
        const user = await userRepository.getUserByConfirmCode(confirmCode);
        if (!user) {
            throw new DomainExceptions(400, "code:code doesnt exist")
        }
        if (user.emailConfirmation.isConfirmed) {
            throw new DomainExceptions(400, "code:email already confirmed")
        }
        // if(user.emailConfirmation.confirmCode !== confirmCode){
        //     throw new DomainExceptions(400, "confirm code is invalid")
        // }
        if (user.emailConfirmation.expirationDate < new Date()) {
            throw new DomainExceptions(400, "confirm code is invalid")
        }
        const result = await userRepository.updateConfirmation(user._id.toString())
        return !!result
    },
    updateRefreshToken: async (refreshToken: string, ip: string, next: NextFunction) => {
        try {
            const payload = await jwtService.checkToken(refreshToken)
            const userId = payload.userId
            const deviceId = payload.deviceId
            const session = await sessionRepository.getSessionByDeviceId(deviceId);
            if (!session || Number(session.exp) < Number(dateFn.getUnixTime(new Date()))) {
                throw new DomainExceptions(401, "refresh-token:invalid or expired")
            }
            if (session.iat !== payload.iat) {
                throw new DomainExceptions(401, "refresh-token:invalid token version")
            }
            const [accessToken, newRefreshToken] = await Promise.all([
                jwtService.createJwt(userId, deviceId, "10s"),
                jwtService.createJwt(userId, deviceId, "20s"),
            ])
            const token = jwtService.decodeToken(newRefreshToken)
            
            await sessionRepository.updateSession(deviceId, {
                iat: token.iat,
                exp: token.exp,
                ip: ip
            })
            // await userRepository.setRefreshToken(user._id.toString(), newRefreshToken)
            return {
                accessToken: accessToken,
                refreshToken: newRefreshToken
            }
        } catch (err) {
            console.log("failed to updateRefreshToken", err);
            next(err)
            return
        }
    },
    logout: async (refreshToken: string, next: NextFunction) => {
        try {
            const payload = await jwtService.checkToken(refreshToken)
            const deviceId = payload.deviceId
            const session = await sessionRepository.getSessionByDeviceId(deviceId);
            if (!session || Number(session.exp) < Number(dateFn.getUnixTime(new Date()))) {
                throw new DomainExceptions(401, "refresh-token:invalid or expired")
            }
            if (session.iat !== payload.iat) {
                throw new DomainExceptions(401, "refresh-token:invalid token version")
            }

            await sessionsService.deleteSessionByDeviceId(refreshToken, deviceId)
            return true
        } catch (err) {
            console.log("failed to logout", err);
            next(err)
            return false
        }
    }
};
