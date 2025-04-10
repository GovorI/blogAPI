import bcrypt from "bcrypt";
import { userRepository } from "../repositories/userRepository";
import { jwtService } from "./jwtService";
import {DomainExceptions} from "../helpers/DomainExceptions";

export type createUserDTO = {
  login: string;
  password: string;
  email: string;
};

type authUserDTO = {
  loginOrEmail: string;
  password: string;
};

export const userService = {
  getUserById: async (userId: string) => {
    return await userRepository.getUserById(userId);
  },
  createUser: async (userData: createUserDTO) => {
    // const errors: { field: string; message: string }[] = [];
    const [existingUserByLogin, existingUserByEmail] = await Promise.all([
      userRepository.getUserByLogin(userData.login),
      userRepository.getUserByEmail(userData.email),
    ]);
    if (existingUserByLogin) {
      throw new DomainExceptions(400, 'User already exists');
      // errors.push({ field: "login", message: "Login already exists" });
    }

    if (existingUserByEmail) {
      throw new DomainExceptions(400, 'User already exists');
      // errors.push({ field: "email", message: "Email already exists" });
    }

    // if (errors.length > 0) {
    //   throw { errors };
    // }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      login: userData.login,
      email: userData.email,
      password: hashedPassword,
    };
    const createdUserId = await userRepository.createUser(newUser);
    return createdUserId.toString();
  },
  getUsers: async () => {},
  deleteUser: async (id: string) => {
    const res = await userRepository.deleteUser(id);
    if (res) return true;
    return false;
  },
  login: async (authData: authUserDTO) => {
      const user = await userRepository.getUserByLoginOrEmail(
        authData.loginOrEmail
      );
      if(!user){
        throw new DomainExceptions(401, "wrong login or password")
      }
      const isCredentials = await bcrypt.compare(
        authData.password,
        user.password
      );
      if(!isCredentials){
        throw new DomainExceptions(401, "wrong login or password")
      }
      return await jwtService.createJwt(user);
  },
};
