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
    role: Roles.CUSTOMER,
};

describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

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
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should return the 200 status code', async () => {
        const userRepo = connection.getRepository(User);
        const data = await userRepo.save({ ...userData, role: Roles.CUSTOMER });

        const accessToken = jwks.token({
            sub: data.id.toString(),
            role: data.role,
        });

        const response = await request(app)
            .get('/auth/self')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
        const userRepo = connection.getRepository(User);
        const data = await userRepo.save({ ...userData, role: Roles.CUSTOMER });

        const accessToken = jwks.token({
            sub: data.id.toString(),
            role: data.role,
        });

        const response = await request(app)
            .get('/auth/self')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.body).toEqual({
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
        });
    });

    it('should return 401 status code if token is not given', async () => {
        const userRepo = connection.getRepository(User);
        await userRepo.save({ ...userData, role: Roles.CUSTOMER });
        const response = await request(app).get('/auth/self').send();
        expect(response.statusCode).toBe(401);
    });

    it('should not return password', async () => {
        const userRepo = connection.getRepository(User);
        const data = await userRepo.save({ ...userData, role: Roles.CUSTOMER });

        const accessToken = jwks.token({
            sub: data.id.toString(),
            role: data.role,
        });

        const response = await request(app)
            .get('/auth/self')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.body).toEqual({
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
        });
    });
});
