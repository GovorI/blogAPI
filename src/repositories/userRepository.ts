import {ObjectId} from "mongodb";
import {
    recoveryPasswordData,
    updateUserCodeConfirmByEmail,
    userSchemaDB,
    usersCollection
} from "../db/db_connection";
import {injectable} from "inversify";
import "reflect-metadata"

@injectable()
export class UserRepository {
    async getUserByLoginOrEmail(loginOrEmail: string) {
        const user = await usersCollection
            .find({
                $or: [
                    {"accountData.email": {$regex: loginOrEmail, $options: "i"}},
                    {"accountData.login": {$regex: loginOrEmail, $options: "i"}},
                ],
            })
            .toArray();
        return user[0];
    }

    async getUserById(userId: string) {
        return await usersCollection.findOne({_id: new ObjectId(userId)});
    }

    async getUserByEmail(email: string) {
        const res = await usersCollection.findOne({"accountData.email": email});
        return res;
    }

    async getUserByLogin(login: string) {
        const res = await usersCollection.findOne({"accountData.login": login});
        console.log("userRepository.getUserByLogin", res);
        return res;
    }

    async getUserByConfirmCode(confirmCode: string) {
        return await usersCollection.findOne({'emailConfirmation.confirmCode': confirmCode});
    }

    async getUserByRefreshToken(refreshToken: string) {
        return await usersCollection.findOne({'auth.refreshToken': refreshToken});
    }

    async createUser(userData: userSchemaDB) {
        const res = await usersCollection.insertOne({
            _id: userData._id,
            accountData: {
                login: userData.accountData.login,
                password: userData.accountData.password,
                email: userData.accountData.email,
                createdAt: new Date(),
            },
            emailConfirmation: {
                confirmCode: userData.emailConfirmation.confirmCode,
                expirationDate: userData.emailConfirmation.expirationDate,
                isConfirmed: userData.emailConfirmation.isConfirmed || false
            },

        });
        return res.insertedId;
    }

    async updateUserCodeConfirmByEmail(email: string, newUserData: updateUserCodeConfirmByEmail) {
        return await usersCollection.updateOne(
            {'accountData.email': email},
            {
                $set: {
                    'emailConfirmation.confirmCode': newUserData.confirmCode,
                    'emailConfirmation.expirationDate': newUserData.expirationDate,

                }
            }
        )
    }

    async setUserPassRecoveryCodeByEmail(email: string, data: recoveryPasswordData) {
        return await usersCollection.updateOne(
            {'accountData.email': email},
            {
                $set: {
                    'recoveryPassword.recoveryPasswordCode': data.recoveryPasswordCode,
                    'recoveryPassword.expirationDate': data.expirationDate,

                }
            }
        )
    }

    async getUserByPassRecoveryCode(recoveryCode: string) {
        return await usersCollection.findOne(
            {"recoveryPassword.recoveryPasswordCode": recoveryCode},
        )
    }

    async updateUserPasswordByRecoveryCode(newPassword: string, recoveryCode: string) {
        return await usersCollection.updateOne(
            {"recoveryPassword.recoveryPasswordCode": recoveryCode},
            {
                $set: {"accountData.password": newPassword},
            }
        )
    }

    async updateConfirmation(id: string) {
        return await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {"emailConfirmation.isConfirmed": true}}
        )
    }

    async setRefreshToken(userId: string, refreshToken: string | null) {
        return await usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: {"auth.refreshToken": refreshToken}},
        )
    }

    async deleteUser(id: string) {
        const res = await usersCollection.deleteOne({_id: new ObjectId(id)});
        if (res.deletedCount === 1) return true;
        return false;
    }
}
