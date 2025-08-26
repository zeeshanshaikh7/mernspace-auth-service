import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { AppDataSource } from '../../src/config/data-source';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';

const userData = {
    firstName: 'zeeshan',
    lastName: 'shaikh',
    email: 'test@example.com',
    password: 'hashedpassword',
    tenantId: 1,
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
        await request(app)
            .post('/users')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        expect(users).toHaveLength(1);
    });

    it('shold create only managers roles', async () => {
        await request(app)
            .post('/users')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        expect(users[0].role).toBe(Roles.MANAGER);
    });

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

// describe('GET /users', () => {
//     let connection: DataSource;
//     let jwks: ReturnType<typeof createJWKSMock>;
//     let adminToken: string;

//     beforeAll(async () => {
//         jwks = createJWKSMock('http://localhost:5501');
//         connection = await AppDataSource.initialize();
//         await connection.synchronize(true);
//     });

//     beforeEach(async () => {
//         jwks.start();
//         // Database truncate
//         await connection.dropDatabase();
//         await connection.synchronize();
//         adminToken = jwks.token({
//             sub: '1',
//             role: Roles.ADMIN,
//         });
//     });

//     afterEach(async () => {
//         jwks.stop();
//     });

//     afterAll(async () => {
//         if (connection && connection.isInitialized) {
//             await connection.destroy();
//         }
//     });

//     it('should return list of users', async () => {
//         const response = await request(app)
//             .get('/users')
//             .set('Cookie', `accessToken=${adminToken}`);

//         expect(response.statusCode).toBe(200);
//         expect(response.body).toBeInstanceOf(Array);
//     });

// });
