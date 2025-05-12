import bcrypt from "bcrypt";
import {userRepository} from "../repositories/userRepository";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {uuid} from "uuidv4";
import dateFn from "date-fns";
import {ObjectId} from "mongodb";

export type createUserDTO = {
    login: string;
    password: string;
    email: string;
    isConfirmed?: boolean;
};

export const userService = {
    getUserById: async (userId: string) => {
        return await userRepository.getUserById(userId);
    },
    createUser: async (userData: createUserDTO) => {
        const [existingUserByLogin, existingUserByEmail] = await Promise.all([
            userRepository.getUserByLogin(userData.login),
            userRepository.getUserByEmail(userData.email),
        ]);
        if (existingUserByLogin) {
            throw new DomainExceptions(400, 'login:Login already exists');
        }

        if (existingUserByEmail) {
            throw new DomainExceptions(400, 'email:Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = {
            _id: new ObjectId(),
            accountData: {
                login: userData.login,
                password: hashedPassword,
                email: userData.email,
                createdAt: new Date(),
            },
            emailConfirmation: {
                confirmCode: uuid(),
                expirationDate: dateFn.add(new Date(), {
                    hours: 1,
                }),
                isConfirmed: userData.isConfirmed || false
            }
        }

        const createdUserId = await userRepository.createUser(newUser);
        return createdUserId.toString();
    },
    deleteUser: async (id: string) => {
        const res = await userRepository.deleteUser(id);
        if (res) return true;
        return false;
    },
};
