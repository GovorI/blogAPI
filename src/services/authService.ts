import bcrypt from "bcrypt";
import {uuid} from "uuidv4";
import dateFn from 'date-fns'
import { userRepository } from "../repositories/userRepository";
import { jwtService } from "./jwtService";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {userService} from "./userService";
import {ObjectId} from "mongodb";
import {emailForm, sendEmail} from "./nodemailer.service";
import nodemailer from "nodemailer";
import {userSchemaDB} from "../db/db_connection";

type authUserDTO = {
    loginOrEmail: string;
    password: string;
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
        if(!user){
            throw new DomainExceptions(401, "wrong login or password")
        }
        const isCredentials = await bcrypt.compare(
            authData.password,
            user.accountData.password
        );
        if(!isCredentials){
            throw new DomainExceptions(401, "wrong login or password")
        }
        return await jwtService.createJwt(user);
    },
    registration: async (userData: registrationDTO) => {
        console.log("authService",userData);
        const createdUserId = await userService.createUser(userData);
        const user = await userService.getUserById(createdUserId);
        const confirmCode = user!.emailConfirmation.confirmCode
        const isSendEmail = await sendEmail(userData.email, confirmCode, emailForm.registrationEmail);
        console.log(isSendEmail);
        if(isSendEmail){
            return true;
        }
            await userRepository.deleteUser(createdUserId);
            return false
    },
    emailResending: async (email: string) => {
        const user = await userRepository.getUserByEmail(email);
        if(!user){
            throw new DomainExceptions(400,'email:User with this email not found')
        }
        if(user.emailConfirmation.isConfirmed){
            throw new DomainExceptions(400, "email:email already confirmed")

        }
            const confirmCode = uuid()
            try {
                const isSendEmail = await sendEmail(email, confirmCode, emailForm.registrationEmail);
                if(isSendEmail){
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
            }catch (e){
                console.log("failed to send email", e)
                throw new DomainExceptions(500, "email:failed to send email");
                // return false;
            }

    },
    confirmation: async (confirmCode: string)=>{
        const user = await userRepository.getUserByConfirmCode(confirmCode);
        if(!user){
            throw new DomainExceptions(400, "code:code doesnt exist")
        }
        if(user.emailConfirmation.isConfirmed){
            throw new DomainExceptions(400, "code:email already confirmed")
        }
        // if(user.emailConfirmation.confirmCode !== confirmCode){
        //     throw new DomainExceptions(400, "confirm code is invalid")
        // }
        if(user.emailConfirmation.expirationDate < new Date()){
            throw new DomainExceptions(400, "confirm code is invalid")
        }
        const result = await userRepository.updateConfirmation(user._id.toString())
        return !!result

    }
};
