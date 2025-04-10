import { Request, Response, NextFunction } from "express";
import { DomainExceptions } from "../helpers/DomainExceptions";

export const errorHandlerMiddleware = (
    err: Error|DomainExceptions,
    req: Request,
    res: Response,
    next: NextFunction
):void => {
    console.error("Error:", err);

    if (err instanceof DomainExceptions) {
          res.status(err.status).json({
            errorsMessages: [
                {
                    field: err.message.split(":")[0] || "general",
                    message: err.message,
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
};