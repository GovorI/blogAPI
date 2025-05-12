import rateLimit from 'express-rate-limit';
import {Request, Response, NextFunction} from "express";

// export const rateLimitMiddleware = rateLimit({
//     windowMs: 10 * 1000,
//     max: 5,
//     handler: (req, res) => {
//         // if(!req.user){
//         //     res.status(401)
//         //     return
//         // }
//         res.status(429).send({
//             errorMessages: [
//                 {field: "rateLimit", message: "Too many requests, try again later."}
//             ]
//             ,
//         })
//     }
// })

const requestTracker = new Map<string, Map<string, { count: number; resetTime: number }>>();

export const rateLimitMiddlewareCreator = (
    maxRequests: number,
    windowMs: number
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || "unknown-ip";
        const url = req.originalUrl;
        const now = Date.now();

        let ipEntry = requestTracker.get(ip);
        if (!ipEntry) {
            ipEntry = new Map<string, { count: number; resetTime: number }>();
            requestTracker.set(ip, ipEntry);
        }

        let urlEntry = ipEntry.get(url);
        // console.log("now--->", now, 'url, ip, urlEntry--->', url, ip, urlEntry);

        if (urlEntry) {
            if (now >= urlEntry.resetTime) {
                // console.log("Resetting counter for IP:", ip, "and URL:", url);
                ipEntry.set(url, { count: 1, resetTime: now + windowMs });
            } else {
                urlEntry.count += 1;
                if (urlEntry.count > maxRequests) {
                    // console.log("Rate limit exceeded for IP:", ip, "and URL:", url);
                    res.status(429).json({
                        errorsMessages: [
                            { field: "rate-limit", message: "Too many requests, please try again later." },
                        ],
                    });
                    return;
                }

                ipEntry.set(url, urlEntry);
            }
        } else {
            // console.log("Creating new entry for IP:", ip, "and URL:", url);
            ipEntry.set(url, { count: 1, resetTime: now + windowMs });
        }

        next();
    };
};