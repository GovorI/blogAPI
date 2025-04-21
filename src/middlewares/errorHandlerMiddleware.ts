import { Request, Response, NextFunction } from "express";
import { DomainExceptions } from "../helpers/DomainExceptions";

export const errorHandlerMiddleware = (
    err: Error|DomainExceptions,
    req: Request,
    res: Response,
    next: NextFunction
):void => {
    console.error(`Error in ${req.method} ${req.path}:`, err);

    if (err instanceof DomainExceptions) {
        console.log("Err message-------------->",err.message);
          res.status(err.status).json({
            errorsMessages: [
                {
                    field: err.message.split(":")[0] || "general",
                    message: err.message.split(':')[1],
                },
            ],
        });
          return
    }

    // Обработка других ошибок
    res.status(500).json({
        errorsMessages: [
            {
                field: "general",
                message: "Internal Server Error",
            },
        ],
    });
    return;
};