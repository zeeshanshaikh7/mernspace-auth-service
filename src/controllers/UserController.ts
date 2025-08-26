import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import createHttpError, { HttpError } from 'http-errors';
import { Roles } from '../constants';
import { UserRequest } from '../types';
import { validationResult } from 'express-validator';

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: UserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;

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
                role: Roles.MANAGER,
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
}
