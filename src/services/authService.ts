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
            jwtService.createJwt(user, deviceId, "10s"),
            jwtService.createJwt(user, deviceId, "20s"), //сделать отдельн создание
        ])
        await sessionRepository.createSession({
            userId: user._id.toString(),
            deviceId: deviceId,
            iat: new Date(),
            deviceName: authData.userAgent,
            ip: authData.ip,
            exp: new Date(Date.now() + 20 * 1000)
        })
        // await userRepository.setRefreshToken(user._id.toString(), refreshToken)
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
            throw new DomainExceptions(500, "email: does not send email")
        }
        return true;
    },
    emailResending: async (email: string) => {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new DomainExceptions(400, 'email:User with this email not found')
        }
        if (user.emailConfirmation.isConfirmed) {
            throw new DomainExceptions(400, "email:email already confirmed")

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
            const user = payload.user
            const deviceId = payload.deviceId
            // const user = await userRepository.getUserByRefreshToken(refreshToken);
            console.log(user)
            // if (!user) {
            //     throw new DomainExceptions(401, "refresh-token:wrong refresh token")
            // }
            const session = await sessionRepository.getSessionByDeviceId(deviceId);
            if (!session || session.exp < new Date()) {
                throw new DomainExceptions(401, "refresh-token: invalid or expired")
            }
            if (session.iat !== payload.iat) {
                throw new DomainExceptions(401, "refresh-token: invalid token version")
            }
            // await jwtService.checkToken(refreshToken)
            const [accessToken, newRefreshToken] = await Promise.all([
                jwtService.createJwt(user, deviceId, "10s"),
                jwtService.createJwt(user, deviceId, "20s"),
            ])
            await sessionRepository.updateSession(deviceId, {
                iat: new Date(),
                exp: new Date(Date.now() + 20 * 1000),
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
        console.log("get user by refresh token---->", refreshToken)
        const user = await userRepository.getUserByRefreshToken(refreshToken);
        if (!user) {
            throw new DomainExceptions(401, "refresh-token:wrong refresh token")
        }
        try {
            await jwtService.checkToken(refreshToken)
            await userRepository.setRefreshToken(user._id.toString(), null);
            return true
        } catch (err) {
            console.log("failed to logout", err);
            next(err)
            return false
        }
    }
};
