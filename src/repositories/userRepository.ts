import { ObjectId } from "mongodb";
import {updateUserCodeConfirmByEmail, userSchemaDB, usersCollection} from "../db/db_connection";

export const userRepository = {
  getUsers: async () => {},
  getUserByLoginOrEmail: async (loginOrEmail: string) => {
    const user = await usersCollection
      .find({
        $or: [
          { "accountData.email": { $regex: loginOrEmail, $options: "i" } },
          { "accountData.login": { $regex: loginOrEmail, $options: "i" } },
        ],
      })
      .toArray();
    return user[0];
  },
  getUserById: async (userId: string) => {
    return await usersCollection.findOne({ _id: new ObjectId(userId) });
  },
  getUserByEmail: async (email: string) => {
    const res = await usersCollection.findOne({ "accountData.email":email });
    console.log("userRepository.getUserByEmail", res);
    return res;
  },
  getUserByLogin: async (login: string) => {
    const res = await usersCollection.findOne({ "accountData.login":login });
    console.log("userRepository.getUserByLogin", res);
    return res;
  },
  getUserByConfirmCode: async (confirmCode: string) => {
    return await usersCollection.findOne({'emailConfirmation.confirmCode' :confirmCode });
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
    console.log("createUser Repo ---- > ", res.insertedId);
    return res.insertedId;
  },
  updateUserCodeConfirmByEmail: async (email: string, newUserData:updateUserCodeConfirmByEmail) => {
    return await usersCollection.updateOne(
          {'accountData.email': email},
          { $set: {
            'emailConfirmation.confirmCode': newUserData.confirmCode,
              'emailConfirmation.expirationDate': newUserData.expirationDate,

            }}
      )
  },
  updateConfirmation: async (id:string) =>{
    return await usersCollection.updateOne(
        {_id: new ObjectId(id)},
        { $set: {"emailConfirmation.isConfirmed": true}}
    )
  },
  deleteUser: async (id: string) => {
    const res = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 1) return true;
    return false;
  },
};
