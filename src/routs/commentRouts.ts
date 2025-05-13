import {authJWTMiddlewareCreator} from "../middlewares/authMiddleware";
import {commentIdValidator, contentInputValidatorComment} from "../validators/commentValidators";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {Router} from "express";
import {container} from "../compositionRoot";
import {CommentsController} from "../controllers/commentsController";

const commentsController= container.get<CommentsController>(CommentsController);

export const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getById.bind(commentsController))
commentsRouter.put('/:id', authJWTMiddlewareCreator(), commentIdValidator,
    contentInputValidatorComment, inputCheckErrorsMiddleware, commentsController.update.bind(commentsController))
commentsRouter.delete('/:id', authJWTMiddlewareCreator(), commentIdValidator,
    inputCheckErrorsMiddleware, commentsController.delete.bind(commentsController))