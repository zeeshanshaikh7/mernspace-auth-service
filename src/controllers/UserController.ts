import { Response, NextFunction } from 'express';
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
}
