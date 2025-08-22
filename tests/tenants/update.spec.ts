import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { Roles } from '../../src/constants';
import { TestDataFactory } from '../utils/TestDataFactory';
import { AppDataSource } from '../../src/config/data-source';

const tenantData = {
    name: 'New Tenant',
    address: '123 Main St',
};

describe('PUT /tenants/:id', () => {
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

    it('should return 200 status code on tenant update', async () => {
        const createResponse = await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(tenantData);

        const response = await request(app)
            .put(`/tenants/${createResponse.body.id}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                name: 'Updated Tenant',
                address: '789 Oak St',
            });
        expect(response.statusCode).toBe(200);
    });

    it('should update tenant data in database', async () => {
        const createResponse = await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(tenantData);

        await request(app)
            .put(`/tenants/${createResponse.body.id}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                name: 'Updated Tenant',
                address: '789 Oak St',
            });

        const tenantRepo = await factory.getTenantRepo();

        const updatedTenant = await tenantRepo.findOne({
            where: {
                id: createResponse.body.id,
            },
        });

        expect(updatedTenant?.name).toBe('Updated Tenant');
        expect(updatedTenant?.address).toBe('789 Oak St');
    });

    it('should return 404 status code if tenant not found', async () => {
        const createResponse = await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(tenantData);

        const response = await request(app)
            .put(`/tenants/${createResponse.body.id + 9999}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                name: 'Updated Tenant',
                address: '789 Oak St',
            });

        expect(response.statusCode).toBe(404);
    });
});
