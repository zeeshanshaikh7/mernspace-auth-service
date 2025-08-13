import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);
const tokenService = new TokenService();

const authController = new AuthController(userService, logger, tokenService);

authRouter.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default authRouter;
