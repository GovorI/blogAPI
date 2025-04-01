import { Request } from "express";

export type PaginationParams = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 1 | -1;
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export const paginationQueries = (req: Request): PaginationParams => ({
  pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
  pageSize: req.query.pageSize ? +req.query.pageSize : 10,
  sortBy: req.query.sortBy ? req.query.sortBy.toString() : "createdAt",
  sortDirection: req.query.sortDirection === "asc" ? 1 : -1,
  searchNameTerm: req.query.searchNameTerm?.toString()
    ? req.query.searchNameTerm.toString()
    : undefined,
  searchLoginTerm: req.query.searchLoginTerm?.toString()
    ? req.query.searchLoginTerm.toString()
    : undefined,
  searchEmailTerm: req.query.searchEmailTerm?.toString()
    ? req.query.searchEmailTerm.toString()
    : undefined,
});
