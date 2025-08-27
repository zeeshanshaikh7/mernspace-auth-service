import { Response, NextFunction, Request } from 'express';
import { UserService } from '../services/UserService';
import createHttpError, { HttpError } from 'http-errors';
import { UserRequest } from '../types';
import { validationResult } from 'express-validator';
import { Logger } from 'winston';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async create(req: UserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password, role, tenantId } =
            req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                error: 'Validation error',
                errors: result.array(),
            });
            return;
        }

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            res.status(200).json({ id: user.id });
        } catch (error) {
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal server error'));
            }
        }
    }

    async update(req: UserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid URL params'));
            return;
        }
        this.logger.info('Request to update user', {
            firstName,
            lastName,
            role,
        });
        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid URL params'));
            return;
        }
        try {
            const user = await this.userService.getOne(Number(userId));
            if (!user) {
                next(createHttpError(404, 'User not found'));
                return;
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid URL params'));
            return;
        }
        try {
            await this.userService.delete(Number(userId));

            res.status(200).json({
                message: `User with userId ${userId} deleted from the database`,
            });
        } catch (error) {
            next(error);
        }
    }
}
