import { TestDataFactory } from './../utils/TestDataFactory';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { AppDataSource } from '../../src/config/data-source';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/entity/Tenant';

const userData = {
    firstName: 'zeeshan',
    lastName: 'shaikh',
    email: 'test@example.com',
    password: 'hashedpassword',
    tenantId: 1,
    role: Roles.MANAGER,
};

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);
    });

    beforeEach(async () => {
        jwks.start();
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should persist the user in the database', async () => {
        const tenantRepository = connection.getRepository(Tenant);

        const tenant = await tenantRepository.save({
            name: 'Test tenant',
            address: 'Test address',
        });

        userData.tenantId = tenant.id;

        await request(app)
            .post('/users')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        expect(users).toHaveLength(1);
    });

    // it('shold create only managers roles', async () => {
    //     await request(app)
    //         .post('/users')
    //         .set('Cookie', `accessToken=${adminToken}`)
    //         .send(userData);

    //     const userRepository = connection.getRepository(User);
    //     const users = await userRepository.find();

    //     expect(users[0].role).toBe(Roles.MANAGER);
    // });

    it('should return 403 if non admin tries to create user', async () => {
        const token = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        });

        const response = await request(app)
            .post('/users')
            .set('Cookie', `accessToken=${token}`)
            .send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        expect(response.statusCode).toBe(403);
        expect(users).toHaveLength(0);
    });

    it('should validate request body', async () => {
        const response = await request(app)
            .post('/users')
            .set('Cookie', `accessToken=${adminToken}`)
            .send({});

        expect(response.statusCode).toBe(400);
    });
});

describe('Patch /users/:id', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let factory: TestDataFactory;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
        await connection.synchronize(true);
        factory = new TestDataFactory(connection, jwks);
    });

    beforeEach(async () => {
        jwks.start();
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should return 200 status code', async () => {
        const user = await factory.createUserWithTenantId();

        const response = await request(app)
            .patch(`/users/${user.id}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                firstName: 'sample',
            });

        expect(response.statusCode).toBe(200);
    });

    it('should persist the new details in the database', async () => {
        const user = await factory.createUserWithTenantId();

        const newData = {
            firstName: 'sample',
        };

        await request(app)
            .patch(`/users/${user.id}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send(newData);

        const users = await factory.getUsers();
        expect(users[0].firstName).toBe(newData.firstName);
    });

    it('should return 400 status code when userId in params is invalid', async () => {
        const response = await request(app)
            .patch(`/users/hello`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                firstName: 'sample',
            });

        const user = await factory.getUsers();

        expect(response.statusCode).toBe(400);
        expect(user).toHaveLength(0);
    });

    it('should return 404 status code if user not found', async () => {
        const response = await request(app)
            .patch(`/users/1`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                firstName: 'sample',
            });

        expect(response.statusCode).toBe(404);
    });
});
