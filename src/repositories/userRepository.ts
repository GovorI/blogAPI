import {ObjectId} from "mongodb";
import {updateUserCodeConfirmByEmail, userSchemaDB, usersCollection} from "../db/db_connection";

export const userRepository = {
    getUserByLoginOrEmail: async (loginOrEmail: string) => {
        const user = await usersCollection
            .find({
                $or: [
                    {"accountData.email": {$regex: loginOrEmail, $options: "i"}},
                    {"accountData.login": {$regex: loginOrEmail, $options: "i"}},
                ],
            })
            .toArray();
        return user[0];
    },
    getUserById: async (userId: string) => {
        return await usersCollection.findOne({_id: new ObjectId(userId)});
    },
    getUserByEmail: async (email: string) => {
        const res = await usersCollection.findOne({"accountData.email": email});
        return res;
    },
    getUserByLogin: async (login: string) => {
        const res = await usersCollection.findOne({"accountData.login": login});
        console.log("userRepository.getUserByLogin", res);
        return res;
    },
    getUserByConfirmCode: async (confirmCode: string) => {
        return await usersCollection.findOne({'emailConfirmation.confirmCode': confirmCode});
    },
    getUserByRefreshToken: async (refreshToken: string) => {
        return await usersCollection.findOne({'auth.refreshToken': refreshToken});
    },
    createUser: async (userData: userSchemaDB) => {
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
    },
    updateUserCodeConfirmByEmail: async (email: string, newUserData: updateUserCodeConfirmByEmail) => {
        return await usersCollection.updateOne(
            {'accountData.email': email},
            {
                $set: {
                    'emailConfirmation.confirmCode': newUserData.confirmCode,
                    'emailConfirmation.expirationDate': newUserData.expirationDate,

                }
            }
        )
    },
    updateConfirmation: async (id: string) => {
        return await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {"emailConfirmation.isConfirmed": true}}
        )
    },
    setRefreshToken: async (userId: string, refreshToken: string | null) => {
        return await usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: {"auth.refreshToken": refreshToken}},
        )
    },
    deleteUser: async (id: string) => {
        const res = await usersCollection.deleteOne({_id: new ObjectId(id)});
        if (res.deletedCount === 1) return true;
        return false;
    },
};
