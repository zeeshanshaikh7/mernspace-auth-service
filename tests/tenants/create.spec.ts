import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { isJWT } from '../utils';
import { AppDataSource } from './../../src/config/data-source';
import { Tenant } from '../../src/entity/Tenant';

const tenantData = {
    name: 'New Tenant',
    address: '123 Main St',
};

describe('POST /tenants', () => {
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
        it('should return 201 status code', async () => {
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            expect(response.statusCode).toBe(201);
        });

        it('should create a new tenant in the database', async () => {
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);
            const tenantRepo = connection.getRepository(Tenant);
            const tenants = await tenantRepo.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
