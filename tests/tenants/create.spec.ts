import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { Roles } from '../../src/constants';
import { TestDataFactory } from '../utils/TestDataFactory';
import { AppDataSource } from './../../src/config/data-source';

const tenantData = {
    name: 'New Tenant',
    address: '123 Main St',
};

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let factory: TestDataFactory;
    let adminToken: string;

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

    afterAll(async () => {
        jwks.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe('Given all fields', () => {
        it('should return 201 status code', async () => {
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send(tenantData);
            expect(response.statusCode).toBe(201);
        });

        it('should create a new tenant in the database', async () => {
            await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send(tenantData);
            const tenants = await factory.getTenants();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenants = await factory.getTenants();
            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not an admin', async () => {
            const { accessToken } = await factory.createUserWithToken();
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${accessToken}`)
                .send(tenantData);
            const tenants = await factory.getTenants();
            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(403);
        });

        it('should return the created tenant data', async () => {
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send(tenantData);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: tenantData.name,
                    address: tenantData.address,
                }),
            );
        });
    });

    describe('Field Validation', () => {
        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send({ address: '123 Main St' });
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 if address is missing', async () => {
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', `accessToken=${adminToken}`)
                .send({ name: 'New Tenant' });
            expect(response.statusCode).toBe(400);
        });
    });
});
