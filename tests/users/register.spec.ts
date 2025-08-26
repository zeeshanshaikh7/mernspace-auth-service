import { AppDataSource } from './../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJWT } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/register', () => {
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

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // 3. Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };
            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // 3. Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist the user in the database', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };
            // 2. Act
            await request(app).post('/auth/register').send(userData);

            //assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should have property id in json response', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };
            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // 3. Assert
            expect(response.body).toHaveProperty('id');
        });

        it('should assign customer role', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };
            // 2. Act
            await request(app).post('/auth/register').send(userData);

            //3. Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store hashed password in the database', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };

            // 2. Act
            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({ select: ['password'] });

            // 3. Assert
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
        });

        it('should return 400 status code if email is already exists', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            const users = await userRepository.find();

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it('should return the access token and refresh token inside a cookie', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

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

        it('should persist refresh token in database', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // 3. Assert
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);

            const tokens = await refreshTokenRepository
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: response.body.id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: '',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstName is missing', async () => {
            //1. Arrange
            const userData = {
                firstName: '',
                lastName: 'shaikh',
                email: 'skzee@gmail.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if lastName is missing', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: '',
                email: 'skzee@gmail.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password is missing', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'skzee@gmail.com',
                password: '',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in proper format', () => {
        it('should trim the email fields', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: ' test@test.com ',
                password: 'pass@123456',
            };

            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            // 2. Act

            // Assert
            expect(user.email).toBe('test@test.com');
        });

        it('should return a 400 status code if email is not a valid email', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'skzeegmail.com',
                password: 'pass@123456',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return a 400 status code if password length is less than 8', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'skzeegmail.com',
                password: 'pass',
            };

            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
