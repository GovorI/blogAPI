import { body, param } from "express-validator";
import { blogRepository } from "../repositories/blogRepository";
import { isValidObjectId } from "mongoose";

export const contentInputValidatorComment = body("content")
  .notEmpty()
  .withMessage("content is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage("Content must be min 20 max 300 characters");

export const commentIdValidator = param("id")
  .notEmpty()
  .isString()
  .withMessage("not string")
  .trim()
    // .isMongoId()
    .custom((id) => {
      if (!isValidObjectId(id)) throw new Error("Invalid Id format");
      return true;
  })
  .withMessage("Provided ID is not valid");
