import {NextFunction, Request, Response} from "express";
import {UserService } from "../services/userService";
import {UserQueryRepo } from "../repositories/userQueryRepo";
import { paginationQueries } from "../helpers/pagination";
import {injectable} from "inversify";
import "reflect-metadata"


@injectable()
export class UserController  {
  constructor(protected userService: UserService, protected userQueryRepo: UserQueryRepo) {
  }
  async getUsers  (req: Request, res: Response) {
    try {
      const {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
        searchEmailTerm,
      } = paginationQueries(req);
      const users = await this.userQueryRepo.getUsers({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
        searchEmailTerm,
      });
      res.status(200).send(users);
      return
    } catch (error) {
      throw new Error("Internal server error");
    }
  }
  async createUser  (req: Request, res: Response, next: NextFunction){
    try {
      const { login, password, email } = req.body;
      const userId = await this.userService.createUser({ login, password, email, isConfirmed: true });
      const user = await this.userQueryRepo.getUserById(userId);
      res.status(201).send(user);
      return
    } catch (error) {
      next(error);
    }
  }
  async deleteUser  (req: Request, res: Response, next: NextFunction) {
    try {
      const deletedUser = await this.userService.deleteUser(req.params.id);
      if (deletedUser) {
        res.sendStatus(204);
        return;
      }
      res.sendStatus(404);
      return;
    } catch (error) {
      next(error)
    }
  }
}


