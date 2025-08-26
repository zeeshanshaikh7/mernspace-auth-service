import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialsService';
import { AuthRequest } from '../types';
import { Roles } from '../constants';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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
                role: Roles.CUSTOMER,
            });
            this.logger.info('user has been registered', { id: response.id });

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(response);

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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                error: 'Validation error',
                errors: result.array(),
            });
            return;
        }

        this.logger.debug('new request to login a user', {
            email,
        });

        const user = await this.userService.findByEmailWithPassword(email);

        try {
            if (!user) {
                this.logger.warn('Login attempt with non-existing email', {
                    email,
                });
                const error = createHttpError(401, 'Invalid email or password');
                next(error);
                return;
            }

            const isPasswordValid =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );

            if (!isPasswordValid) {
                this.logger.warn('Login attempt with invalid password', {
                    email,
                    password,
                });
                const error = createHttpError(401, 'Invalid email or password');
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(
                { ...payload, id: newRefreshToken.id.toString() },
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

            this.logger.info('user has been logged in', { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const error = createHttpError(404, 'User not found');
                next(error);
                return;
            }

            res.status(200).json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const error = createHttpError(
                    400,
                    'User with the token not found',
                );
                next(error);
                return;
            }

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            await this.tokenService.invalidateRefreshToken(
                Number(req.auth.jti),
            );

            const refreshToken = this.tokenService.generateRefreshToken(
                { ...payload, id: newRefreshToken.id.toString() },
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

            res.status(200).json({ id: newRefreshToken.id });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.invalidateRefreshToken(
                Number(req.auth.jti),
            );

            this.logger.info('Refresh token has been invalidated', {
                id: req.auth.jti,
            });

            this.logger.info('user has been logged out', { id: req.auth.sub });

            res.clearCookie('accessToken', {
                domain: 'localhost',
                sameSite: 'strict',
                httpOnly: true,
            });
            res.clearCookie('refreshToken', {
                domain: 'localhost',
                sameSite: 'strict',
                httpOnly: true,
            });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }
}
