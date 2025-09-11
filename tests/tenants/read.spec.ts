import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { Roles } from '../../src/constants';
import { AppDataSource } from './../../src/config/data-source';

const tenantData = {
    name: 'New Tenant',
    address: '123 Main St',
};

describe('GET /tenants', () => {
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

    afterAll(async () => {
        jwks.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should return all tenants', async () => {
        await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(tenantData);
        await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send({
                name: 'Another Tenant',
                address: '456 Elm St',
            });

        const response = await request(app)
            .get('/tenants')
            .set('Cookie', `accessToken=${adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
    });
});

describe('GET /tenants/:id', () => {
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

    afterAll(async () => {
        jwks.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    it('should return 404 if tenant is not found', async () => {
        const response = await request(app)
            .get('/tenants/999')
            .set('Cookie', `accessToken=${adminToken}`);
        expect(response.statusCode).toBe(404);
    });

    it('should return tenant data if found', async () => {
        const createResponse = await request(app)
            .post('/tenants')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(tenantData);

        const response = await request(app)
            .get(`/tenants/${createResponse.body.id}`)
            .set('Cookie', `accessToken=${adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: createResponse.body.id,
                name: createResponse.body.name,
                address: createResponse.body.address,
            }),
        );
    });
});
