import bcrypt from "bcrypt";
import {uuid} from "uuidv4";
import dateFn from 'date-fns'
import {jwtService} from "./jwtService";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {emailForm, sendEmail} from "./nodemailer.service";
import {NextFunction} from "express";
import {injectable} from "inversify";
import {UserRepository} from "../repositories/userRepository";
import {UserService} from "./userService";
import {SessionRepository} from "../repositories/sessionRepository";
import {SessionsService} from "./sessionService";
import "reflect-metadata"

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

@injectable()
export class AuthService {
    constructor(protected userRepository: UserRepository,
                protected userService: UserService,
                protected sessionRepository: SessionRepository,
                protected sessionsService: SessionsService) {
    }

    async login(authData: authUserDTO) {
        const user = await this.userRepository.getUserByLoginOrEmail(
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
            jwtService.createJwt(user._id.toString(), deviceId, "20s"),
            jwtService.createJwt(user._id.toString(), deviceId, "30s"), //сделать отдельн создание
        ])
        const token = jwtService.decodeToken(refreshToken)
        await this.sessionRepository.createSession({
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
    }

    async registration(userData: registrationDTO) {
        console.log("authService", userData);
        const createdUserId = await this.userService.createUser(userData);
        if (!createdUserId) {
            throw new DomainExceptions(500, "user:does not create user")
        }
        const user = await this.userService.getUserById(createdUserId);
        const confirmCode = user!.emailConfirmation.confirmCode
        const isSendEmail = await sendEmail(userData.email, confirmCode, emailForm.registrationEmail);
        console.log(isSendEmail);
        if (!isSendEmail) {
            await this.userRepository.deleteUser(createdUserId);
            throw new DomainExceptions(500, "email:does not send email")
        }
        return true;
    }

    async emailForPassRecovery(email: string) {
        const user = await this.userRepository.getUserByEmail(email);
        const resetCode = uuid()
        try {
            const isSendEmail = sendEmail(email, resetCode, emailForm.passwordRecoveryEmail)
            // if(isSendEmail){
            const recoveryData = {
                recoveryPasswordCode: resetCode,
                expirationDate: dateFn.add(new Date(), {
                    hours: 1
                })
            }
            const res = await this.userRepository.setUserPassRecoveryCodeByEmail(email, recoveryData)
            console.log(res)
            return true
            // }
            // return false
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async emailResending(email: string) {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            throw new DomainExceptions(400, 'email:User with this email not found')
            // return true
        }
        if (user.emailConfirmation.isConfirmed) {
            throw new DomainExceptions(400, "email:email already confirmed")
            // return true
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
                const res = await this.userRepository.updateUserCodeConfirmByEmail(email, newUserData)
                console.log(res)
                return true
            }
            return false
        } catch (e) {
            console.log("failed to send email", e)
            throw new DomainExceptions(500, "email:failed to send email");
            // return false;
        }

    }

    async confirmation(confirmCode: string) {
        const user = await this.userRepository.getUserByConfirmCode(confirmCode);
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
        const result = await this.userRepository.updateConfirmation(user._id.toString())
        return !!result
    }

    async setNewPassword(newPassword: string, recoveryCode: string) {
        const user = await this.userRepository.getUserByPassRecoveryCode(recoveryCode)
        if (!user) {
            throw new DomainExceptions(400, "recoveryCode:does not exist")
        }
        if (user.recoveryPassword!.expirationDate < new Date()) {
            throw new DomainExceptions(400, "recoveryCode:recoveryCode code is invalid")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const isDone = await this.userRepository.updateUserPasswordByRecoveryCode(hashedPassword, recoveryCode);
        if (isDone) {
            return true
        }
        return false
    }

    async updateRefreshToken(refreshToken: string, ip: string, next: NextFunction) {
        try {
            const payload = await jwtService.checkToken(refreshToken)
            const userId = payload.userId
            const deviceId = payload.deviceId
            const session = await this.sessionRepository.getSessionByDeviceId(deviceId);
            if (!session || Number(session.exp) < Number(dateFn.getUnixTime(new Date()))) {
                throw new DomainExceptions(401, "refresh-token:invalid or expired")
            }
            if (session.iat !== payload.iat) {
                throw new DomainExceptions(401, "refresh-token:invalid token version")
            }
            const [accessToken, newRefreshToken] = await Promise.all([
                jwtService.createJwt(userId, deviceId, "20s"),
                jwtService.createJwt(userId, deviceId, "30s"),
            ])
            const token = jwtService.decodeToken(newRefreshToken)

            await this.sessionRepository.updateSession(deviceId, {
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
    }

    async logout(refreshToken: string, next: NextFunction) {
        try {
            const payload = await jwtService.checkToken(refreshToken)
            const deviceId = payload.deviceId
            const session = await this.sessionRepository.getSessionByDeviceId(deviceId);
            if (!session || Number(session.exp) < Number(dateFn.getUnixTime(new Date()))) {
                throw new DomainExceptions(401, "refresh-token:invalid or expired")
            }
            if (session.iat !== payload.iat) {
                throw new DomainExceptions(401, "refresh-token:invalid token version")
            }

            await this.sessionsService.deleteSessionByDeviceId(refreshToken, deviceId)
            return true
        } catch (err) {
            console.log("failed to logout", err);
            next(err)
            return false
        }
    }
}
