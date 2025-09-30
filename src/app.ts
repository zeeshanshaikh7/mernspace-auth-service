import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenants';
import cookieParser from 'cookie-parser';
import path from 'path';
import userRouter from './routes/user';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use('/.well-known', express.static(path.join(publicPath, '.well-known')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('welcome to auth service new');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error.message);

    const statusCode = error.statusCode || error.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: error.name,
                message: error.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;
