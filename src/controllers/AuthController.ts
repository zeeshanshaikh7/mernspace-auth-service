import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;

        // validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                error: 'Validation error',
                errors: result.array(),
            });
            return;
        }

        this.logger.debug('new request to register a user', {
            firstName,
            lastName,
            email,
        });

        try {
            const response = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('user has been registered', { id: response.id });

            const MS_IN_ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

            // persist the refresh token
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepo.save({
                user: response,
                expiresAt: new Date(Date.now() + MS_IN_ONE_YEAR),
            });

            const payload: JwtPayload = {
                sub: String(response.id),
                role: response.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                newRefreshToken.id.toString(),
            );

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            res.status(201).json({ id: response.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
