import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export type AuthCookie = {
    refreshToken: string;
    accessToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        jti?: string; // only for refresh tokens
    };
}

export interface IRefreshTokenPayload {
    jti: string;
    sub: string;
}
