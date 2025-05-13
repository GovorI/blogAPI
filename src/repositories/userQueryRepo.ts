import { ObjectId } from "mongodb";
import { userSchemaDB, usersCollection } from "../db/db_connection";
import { userViewModel } from "../db/db_connection";
import { PaginationParams } from "../helpers/pagination";
import {DomainExceptions} from "../helpers/DomainExceptions";
import {injectable} from "inversify";
import "reflect-metadata"

type pagingMapDTO = {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  items: userSchemaDB[];
};

@injectable()
export class UserQueryRepo  {
  async getUserById  (id: string): Promise<userViewModel> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if(!user) {throw new DomainExceptions(404, 'User not found')}
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }
  async getUsers({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
  }: PaginationParams) {
    const filter: any = {};
    if (searchLoginTerm || searchEmailTerm) {
      const orConditions = [];

      if (searchLoginTerm) {
        orConditions.push({
          login: { $regex: searchLoginTerm, $options: "i" },
        });
      }

      if (searchEmailTerm) {
        orConditions.push({
          email: { $regex: searchEmailTerm, $options: "i" },
        });
      }

      filter.$or = orConditions;
    }
    console.log("search filter -------------->", filter);
    const [items, totalCount] = await Promise.all([
      usersCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      usersCollection.countDocuments(filter),
    ]);
    return mapUsersWithPaging({ totalCount, pageSize, pageNumber, items });
  }
}

function mapUserToViewModel(user: userSchemaDB): userViewModel {
  return {
    id: user._id.toString(),
    login: user.accountData.login,
    email: user.accountData.email,
    createdAt: user.accountData.createdAt.toISOString(),
  };
}

function mapUsersWithPaging({
  totalCount,
  pageSize,
  pageNumber,
  items,
}: pagingMapDTO) {
  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount,
    items: items.map((user) => {
      return mapUserToViewModel(user);
    }),
  };
}
