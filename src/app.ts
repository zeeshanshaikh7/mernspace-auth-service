import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('welcome to auth service new');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error.message);

    const statusCode = error.statusCode || 500;

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

app.use('/auth', authRouter);

export default app;
