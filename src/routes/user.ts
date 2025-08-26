import { NextFunction, Request, Response, Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { UserController } from '../controllers/UserController';
import { User } from '../entity/User';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { UserService } from '../services/UserService';
import { UserRequest } from '../types';
import { registerValidator } from '../validators/auth-validator';
import { Roles } from './../constants/index';
import logger from '../config/logger';

const userRouter = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService, logger);

userRouter.post(
    '/',
    authenticate,
    canAccess(Roles.ADMIN),
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req as UserRequest, res, next),
);

export default userRouter;
