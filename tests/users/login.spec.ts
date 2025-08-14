import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { isJWT } from '../utils';
import { AppDataSource } from './../../src/config/data-source';

const userData = {
    firstName: 'zeeshan',
    lastName: 'shaikh',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'customer',
};

describe('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should return 401 if email does not exist', async () => {
        const response = await request(app).post('/auth/login').send({
            email: 'nonexistent@example.com',
            password: 'password',
        });
        expect(response.statusCode).toBe(401);
    });

    it('should return 401 if password is incorrect', async () => {
        await request(app).post('/auth/register').send(userData);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        const user = users[0];

        const response = await request(app).post('/auth/login').send({
            email: user.email,
            password: 'wrongpassword',
        });
        expect(response.statusCode).toBe(401);
    });

    it('should return user id in response', async () => {
        await request(app).post('/auth/register').send(userData);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        const user = users[0];

        const response = await request(app).post('/auth/login').send({
            email: user.email,
            password: 'hashedpassword',
        });

        expect(response.body.id).toBe(user.id);
    });

    it('should return the access token and refresh token inside a cookie', async () => {
        await request(app).post('/auth/register').send(userData);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        const user = users[0];

        const response = await request(app).post('/auth/login').send({
            email: user.email,
            password: 'hashedpassword',
        });

        interface Header {
            ['set-cookie']: string[];
        }

        //3. Assert
        const cookies =
            (response.headers as unknown as Header)['set-cookie'] || [];

        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        cookies.forEach((cookie) => {
            if (cookie.startsWith('accessToken=')) {
                accessToken = cookie.split(';')[0].split('=')[1];
            }
            if (cookie.startsWith('refreshToken=')) {
                refreshToken = cookie.split(';')[0].split('=')[1];
            }
        });

        expect(accessToken).not.toBeNull();
        expect(refreshToken).not.toBeNull();

        expect(isJWT(accessToken)).toBeTruthy();
        expect(isJWT(refreshToken)).toBeTruthy();
    });

    it('should return 200 if login is successful', async () => {
        await request(app).post('/auth/register').send(userData);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        const user = users[0];

        const response = await request(app).post('/auth/login').send({
            email: user.email,
            password: 'hashedpassword',
        });

        expect(response.statusCode).toBe(200);
    });
});
