import nodemailer from "nodemailer";
import {SETTINGS} from "../settings";

export const emailForm = {
    registrationEmail(code: string) {
        return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`
    },
    passwordRecoveryEmail(code: string) {
        return `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`
    }
}

export async function sendEmail(email: string, code: string, template:(code: string)=>string){
    try {
    let transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: SETTINGS.EMAIL_AUTH.EMAIL,
            pass: SETTINGS.EMAIL_AUTH.PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    })
    let info = await transporter.sendMail({
        from: SETTINGS.EMAIL_AUTH.EMAIL,
        to: email,
        subject: "confirm registration",
        html: template(code)
    });
    return !!info
    }catch (error) {
        console.log(error);
        return false
    }
}