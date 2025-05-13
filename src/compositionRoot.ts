import "reflect-metadata"
import {Container} from "inversify";
import {UserRepository} from "./repositories/userRepository";
import {UserService} from "./services/userService";
import {UserController} from "./controllers/userController";
import {UserQueryRepo} from "./repositories/userQueryRepo";
import {AuthController} from "./controllers/authController";
import {AuthService} from "./services/authService";
import {BlogRepository} from "./repositories/blogRepository";
import {BlogQueryRepo} from "./repositories/blogQueryRepo";
import {PostQueryRepo} from "./repositories/postQueryRepo";
import {PostsController} from "./controllers/postsController";
import {BlogService} from "./services/blogService";
import {BlogsController} from "./controllers/blogsController";
import {PostService} from "./services/postService";
import {PostRepository} from "./repositories/postRepository";
import {CommentsController} from "./controllers/commentsController";
import {CommentQueryRepo} from "./repositories/commentQueryRepo";
import {CommentService} from "./services/commentService";
import {CommentRepository} from "./repositories/commentRepository";
import {SecurityController} from "./controllers/securityController";
import {SessionsQueryService} from "./services/sessionsQueryService";
import {SessionsService} from "./services/sessionService";
import {SessionRepository} from "./repositories/sessionRepository";
import {SessionQueryRepo} from "./repositories/sessionQueryRepo";

// export const userRepository = new UserRepository();
// const userQueryRepo = new UserQueryRepo()
// export const userService = new UserService(userRepository);
// export const userController = new UserController(userService, userQueryRepo);

export const container = new Container();

container.bind<UserController>(UserController).to(UserController);
container.bind<UserService>(UserService).to(UserService);
container.bind<UserQueryRepo>(UserQueryRepo).to(UserQueryRepo);
container.bind<UserRepository>(UserRepository).to(UserRepository);

container.bind<AuthController>(AuthController).to(AuthController);
container.bind<AuthService>(AuthService).to(AuthService);

container.bind<BlogsController>(BlogsController).to(BlogsController);
container.bind<BlogService>(BlogService).to(BlogService);
container.bind<BlogRepository>(BlogRepository).to(BlogRepository);
container.bind<BlogQueryRepo>(BlogQueryRepo).to(BlogQueryRepo);

container.bind<PostsController>(PostsController).to(PostsController);
container.bind<PostService>(PostService).to(PostService);
container.bind<PostQueryRepo>(PostQueryRepo).to(PostQueryRepo);
container.bind<PostRepository>(PostRepository).to(PostRepository);

container.bind<CommentsController>(CommentsController).to(CommentsController);
container.bind<CommentService>(CommentService).to(CommentService);
container.bind<CommentQueryRepo>(CommentQueryRepo).to(CommentQueryRepo);
container.bind<CommentRepository>(CommentRepository).to(CommentRepository);

container.bind<SecurityController>(SecurityController).to(SecurityController);
container.bind<SessionsService>(SessionsService).to(SessionsService);
container.bind<SessionsQueryService>(SessionsQueryService).to(SessionsQueryService);
container.bind<SessionQueryRepo>(SessionQueryRepo).to(SessionQueryRepo);
container.bind<SessionRepository>(SessionRepository).to(SessionRepository);
