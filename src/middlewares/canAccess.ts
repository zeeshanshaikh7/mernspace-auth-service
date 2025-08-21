import { AuthRequest } from './../types/index';
import { NextFunction, Response, Request } from 'express';
import { IRole } from './../constants/index';
import createHttpError from 'http-errors';

export const canAccess = (role: IRole | IRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const userRole = _req.auth.role as IRole;

        const allowedRoles = Array.isArray(role) ? role : [role];

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        const error = createHttpError(403, 'Forbidden');
        return next(error);
    };
};
