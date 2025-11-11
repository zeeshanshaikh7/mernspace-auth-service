import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import 'reflect-metadata';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenants';
import userRouter from './routes/user';

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

// it should be at last
app.use(globalErrorHandler);

export default app;
