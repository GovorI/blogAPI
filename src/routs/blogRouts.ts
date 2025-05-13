import {Router} from "express";
import {authBaseMiddleware} from "../validators/authValidator";
import {contentInputValidator, postTitleInputValidator, shortDescriptionValidator} from "../validators/postValidators";
import {inputCheckErrorsMiddleware} from "../validators/inputCheckErrorsMiddleware";
import {descriptionValidator, nameValidator, websiteUrlValidator} from "../validators/blogValidators";
import {container} from "../compositionRoot";
import {BlogsController} from "../controllers/blogsController";


const blogsController = container.get<BlogsController>(BlogsController)
export const blogsRouter = Router();

blogsRouter.get("/", blogsController.getBlogs.bind(blogsController));
blogsRouter.get("/:id", blogsController.getById.bind(blogsController));
blogsRouter.get("/:id/posts",  blogsController.getAllPostsForThisBlog.bind(blogsController));
blogsRouter.post(
    "/:id/posts",
    authBaseMiddleware,
    postTitleInputValidator,
    shortDescriptionValidator,
    contentInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createNewPostForThisBlog.bind(blogsController)
);
blogsRouter.post(
    "/",
    authBaseMiddleware,
    nameValidator,
    descriptionValidator,
    websiteUrlValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog.bind(blogsController)
);
blogsRouter.put(
    "/:id",
    authBaseMiddleware,
    nameValidator,
    descriptionValidator,
    websiteUrlValidator,
    inputCheckErrorsMiddleware,
    blogsController.update.bind(blogsController)
);
blogsRouter.delete(
    "/:id",
    authBaseMiddleware,
    inputCheckErrorsMiddleware,
    blogsController.deleteById.bind(blogsController)
);