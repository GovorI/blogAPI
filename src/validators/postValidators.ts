import { body, param } from "express-validator";
import { blogRepository } from "../blogs/blogRepository";
import { isValidObjectId } from "mongoose";

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
  .trim()
  // .isMongoId()
  .custom(async (blogId) => {
    if (!isValidObjectId(blogId)) throw new Error('"Invalid Id format"');
    const blog = await blogRepository.getById(blogId);
    if (!blog) throw new Error("blog not found");
  });

export const postIdValidator = param("id")
  .notEmpty()
  .isString()
  .withMessage("not string")
  .trim()
  .custom((id) => {
    if (!isValidObjectId(id)) throw new Error("Invalid Id format");
    return true;
  })
  .withMessage("Provided ID is not valid");
