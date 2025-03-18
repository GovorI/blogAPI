import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { blogRepository } from "../blogs/blogRepository";
import { isValidObjectId } from "mongoose";

export const nameValidator = body("name")
  .notEmpty()
  .withMessage("name is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 2, max: 15 })
  .withMessage("min 2 symbols, max 15");

export const descriptionValidator = body("description")
  .notEmpty()
  .withMessage("description is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage("more then 500 or 0");

export const websiteUrlValidator = body("websiteUrl")
  .notEmpty()
  .withMessage("websiteUrl is required")
  .isString()
  .withMessage("not string")
  .trim()
  .isURL()
  .withMessage("not url")
  .isLength({ min: 1, max: 100 })
  .withMessage("more then 100 or 0");

// export const blogIdValidator = param("id")
//   .notEmpty()
//   .isString()
//   .withMessage("not string")
//   .trim()
//   // .isMongoId();
//   .custom((id) => {
//     if (!isValidObjectId(id)) throw new Error("Invalid Id format");
//     return true;
//   })
//   .withMessage("Provided ID is not valid");

// export const checkBlogExistenceForPost = body("blogId").custom(
//   async (blogId) => {
//     const blog = await blogRepository.getById(blogId);
//     if (!blog) {
//       throw new Error("blog not found");
//     }
//     return true;
//   }
// );
