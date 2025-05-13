import bcrypt from "bcrypt";
import dateFn from "date-fns";
import {uuid} from "uuidv4";
import {ObjectId} from "mongodb";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {UserRepository} from "../repositories/userRepository";
import {injectable} from "inversify";
import "reflect-metadata"

export type createUserDTO = {
    login: string;
    password: string;
    email: string;
    isConfirmed?: boolean;
};

@injectable()
export class UserService {
    constructor(protected userRepository: UserRepository) {
    }
    async getUserById(userId: string) {
        return await this.userRepository.getUserById(userId);
    }
    async createUser(userData: createUserDTO) {
        const [existingUserByLogin, existingUserByEmail] = await Promise.all([
            this.userRepository.getUserByLogin(userData.login),
            this.userRepository.getUserByEmail(userData.email),
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

        const createdUserId = await this.userRepository.createUser(newUser);
        return createdUserId.toString();
    }

    async deleteUser(id: string) {
        const res = await this.userRepository.deleteUser(id);
        if (res) return true;
        return false;
    }
}
