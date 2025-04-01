import { ObjectId } from "mongodb";
import { usersCollection } from "../db/db_connection";
import { createUserDTO } from "../services/userService";

export const userRepository = {
  getUsers: async () => {},
  getUserByLoginOrEmail: async (loginOrEmail: string) => {
    const user = await usersCollection
      .find({
        $or: [
          { email: { $regex: loginOrEmail, $options: "i" } },
          { login: { $regex: loginOrEmail, $options: "i" } },
        ],
      })
      .toArray();
    return user[0];
  },
  getUserByEmail: async (email: string) => {
    const res = await usersCollection.findOne({ email });
    console.log("userRepository.getUserByEmail", res);
    return res;
  },
  getUserByLogin: async (login: string) => {
    const res = await usersCollection.findOne({ login });
    console.log("userRepository.getUserByLogin", res);
    return res;
  },
  createUser: async (userData: createUserDTO) => {
    const res = await usersCollection.insertOne({
      ...userData,
      createdAt: new Date(),
    });
    console.log("createUser Repo ---- > ", res.insertedId);
    return res.insertedId;
  },
  deleteUser: async (id: string) => {
    const res = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 1) return true;
    return false;
  },
};
