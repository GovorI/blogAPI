import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { blogRepository } from "../blogs/blogRepository";

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

export const blogIdValidator = param("id")
  .notEmpty()
  .isString()
  .withMessage("not string")
  .trim()
  .custom((id) => {
    const blog = blogRepository.getById(id);
    if (!blog) throw new Error("Blog not found");
    return true;
  });

export const findBlogValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const blog = blogRepository.getById(req.body.blogId);
  if (blog) {
    next();
  } else
    res.status(400).json({
      errorsMessages: [{ field: "blogId", message: "Blog not found" }],
    });
  // if (!blog) {
  //   req.errors = req.errors || [];
  //   req.errors.push({ field: "blogId", message: "Blog not found" });
  // }
  // next();
};

export const checkBlogExistenceForPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const blogId = req.body.blogId;
  const blog = blogRepository.getById(blogId);

  if (!blog) {
    // Добавляем ошибку в req.errors
    req.errors = req.errors || [];
    req.errors.push({ field: "blogId", message: "Blog not found" });
  }
  next();
};
