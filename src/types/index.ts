import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}
/* =========================== Tenant ============================== */
export interface TenantData {
    name: string;
    address: string;
}
export interface TenantRequestBody extends Request {
    body: TenantData;
}

/* =========================== User ============================== */

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

export interface UserRequest extends Request {
    body: UserData;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    tenantId?: number;
}

export interface UserQueryParams {
    perPage: number;
    currentPage: number;
    q: string;
    role: string;
}

export interface TenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}
