import {Router, Request, Response, NextFunction} from "express";
import {commentQueryRepo} from "../repositories/commentQueryRepo";
import {commentService} from "../services/commentService";
import {authJWTMiddleware} from "../middlewares/authMiddleware";
import {commentIdValidator, contentInputValidatorComment} from "../validators/commentValidators";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";

export const commentsRouter = Router();
const commentsController = {
    getById: async (req: Request, res: Response, next: NextFunction) => {
       try{
           console.log(req.params.commentId);
            const result = await commentQueryRepo.getCommentById(req.params.id);
           console.log("get CommentById --->",result)
            if (!result) {
                res.sendStatus(404)
            }
            res.status(200).send(result)
        }catch(error){
           next(error)
       }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        try{
            const commentId = req.params.id
            const content = req.body.content
            const userId = req.user!._id.toString()
            const isUpdated = await commentService.updateComment({commentId, content, userId})
            if (!isUpdated) {
                res.sendStatus(404)
                return
            }
            res.sendStatus(204)
        }catch (error){
            next(error)
        }

    },
    delete: async (req: Request, res: Response, next: NextFunction) => {
        try{
            const commentId = req.params.id
            const userId = req.user!._id.toString()
            const isDelete = await commentService.deleteCommentById(userId, commentId)
            if (!isDelete) {
                res.sendStatus(404)
                return
            }
            res.sendStatus(204)
        }catch (error) {
            next(error);
        }
    },
}

commentsRouter.get('/:id', commentsController.getById)
commentsRouter.put('/:id', authJWTMiddleware, commentIdValidator, contentInputValidatorComment, inputCheckErrorsMiddleware, commentsController.update)
commentsRouter.delete('/:id', authJWTMiddleware, commentIdValidator, inputCheckErrorsMiddleware, commentsController.delete)