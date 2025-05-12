import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { createBlogDTO } from "../services/blogService";
import { createPostDTO } from "../services/postService";

export type FieldNamesType = keyof createBlogDTO | keyof createPostDTO;
export type OutputErrorsType = {
  errorsMessages: { message: string; field: FieldNamesType }[];
};

export const inputCheckErrorsMiddleware = (
  req: Request,
  res: Response<OutputErrorsType>,
  next: NextFunction
) => {
  const e = validationResult(req);
  if (!e.isEmpty()) {
    const eArray = e.array({ onlyFirstError: true }) as {
      path: FieldNamesType;
      msg: string;
    }[];
    // console.log(eArray);

    res.status(400).json({
      errorsMessages: eArray.map((x) => ({
        field: x.path,
        message: x.msg
      })),
    });
    return;
  }

  next();
};
