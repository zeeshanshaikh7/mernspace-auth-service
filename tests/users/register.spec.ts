import { AppDataSource } from './../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

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
                password: 'secrete',
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
                password: 'secrete',
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
                password: 'secrete',
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
                password: 'secrete',
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
                password: 'secrete',
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
                password: 'secrete',
            };

            // 2. Act
            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

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
                password: 'secrete',
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
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: '',
                password: 'secrete',
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
