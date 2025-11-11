/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '../config';
import logger from '../config/logger';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const errorId = uuidv4();
    const statusCode = err.status || 500;
    const isProduction = Config.NODE_ENV === 'production';
    let message = isProduction ? 'Internal server error' : err.message;
    if (statusCode === 400) {
        message = err.message;
    }

    logger.error(err.message, {
        id: errorId,
        error: err.stack,
        statusCode,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                location: 'server',
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
