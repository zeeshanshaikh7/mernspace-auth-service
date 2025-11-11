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
import listUserValidator from '../validators/list-users-validator';
import updateUserValidator from '../validators/update-user-validator';

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

userRouter.patch(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    updateUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req as UserRequest, res, next),
);

userRouter.get(
    '/',
    authenticate,
    listUserValidator,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

userRouter.get(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next),
);

userRouter.delete(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next),
);

export default userRouter;
