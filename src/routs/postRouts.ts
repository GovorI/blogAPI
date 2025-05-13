import {Router} from "express";
import {
    contentInputValidator,
    postIdValidator,
    postTitleInputValidator,
    shortDescriptionValidator
} from "../validators/postValidators";
import {authBaseMiddleware} from "../validators/authValidator";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {authJWTMiddlewareCreator} from "../middlewares/authMiddleware";
import {contentInputValidatorComment} from "../validators/commentValidators";
import {PostsController} from "../controllers/postsController";
import {container} from "../compositionRoot";

const postsController = container.get<PostsController>(PostsController);
export const postsRouter = Router();

postsRouter.get("/", postsController.getAll.bind(postsController));
postsRouter.get("/:id/comments", postsController.getCommentsWithPagination.bind(postsController));
postsRouter.get("/:id", postIdValidator, postsController.getById.bind(postsController));
postsRouter.post(
    "/",
    authBaseMiddleware,
    postTitleInputValidator,
    shortDescriptionValidator,
    contentInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createPost.bind(postsController)
);
postsRouter.post(
    "/:id/comments",
    authJWTMiddlewareCreator(),
    postIdValidator,
    contentInputValidatorComment,
    inputCheckErrorsMiddleware,
    postsController.createComment.bind(postsController)
);
postsRouter.put(
    "/:id",
    authBaseMiddleware,
    postIdValidator,
    postTitleInputValidator,
    shortDescriptionValidator,
    contentInputValidator,
    inputCheckErrorsMiddleware,
    postsController.update.bind(postsController)
);
postsRouter.delete(
    "/:id",
    authBaseMiddleware,
    postIdValidator,
    inputCheckErrorsMiddleware,
    postsController.deleteById.bind(postsController)
);