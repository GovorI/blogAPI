import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { blogRepository } from "../blogs/blogRepository";
import { isEmpty } from "class-validator";

export const postTitleInputValidator = body("title")
  .notEmpty()
  .withMessage("title is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 30 })
  .withMessage("more then 30 or 0");

export const shortDescriptionValidator = body("shortDescription")
  .notEmpty()
  .withMessage("shortDescription is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage("more then 100 or 0");

export const contentInputValidator = body("content")
  .notEmpty()
  .withMessage("content is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 1000 })
  .withMessage("more then 1000 or 0");

export const blogIdValidator = body("blogId")
  .notEmpty()
  .withMessage("blogId is required")
  .isString()
  .withMessage("not string")
  .trim();
