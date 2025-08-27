import { DataSource } from 'typeorm';
import { User } from '../../src/entity/User';
import { Tenant } from '../../src/entity/Tenant';
import { Roles } from '../../src/constants';
import createJWKSMock from 'mock-jwks';

export class TestDataFactory {
    constructor(
        private connection: DataSource,
        private jwks: ReturnType<typeof createJWKSMock>,
    ) {}

    async createUser(userData: Partial<User> = {}) {
        const userRepo = this.connection.getRepository(User);

        const defaultData = {
            firstName: 'zeeshan',
            lastName: 'shaikh',
            email: 'test@example.com',
            password: 'hashedpassword',
            role: Roles.CUSTOMER,
            ...userData, // Override defaults
        };
        return await userRepo.save(defaultData);
    }

    async createUserWithTenantId() {
        const userRepository = this.connection.getRepository(User);
        const tenant = await this.createTenant();
        const userData = {
            firstName: 'zeeshan',
            lastName: 'shaikh',
            email: 'test@example.com',
            password: 'hashedpassword',
            tenant: tenant,
            role: Roles.MANAGER,
        };
        return await userRepository.save(userData);
    }

    async createUserWithToken(userData: Partial<User> = {}) {
        const user = await this.createUser(userData);
        const accessToken = this.jwks.token({
            sub: user.id.toString(),
            role: user.role,
        });
        return { user, accessToken };
    }

    async createTenant(tenantData: Partial<Tenant> = {}) {
        const tenantRepo = this.connection.getRepository(Tenant);
        const defaultData = {
            name: 'New Tenant',
            address: '123 Main St',
            ...tenantData,
        };
        return await tenantRepo.save(defaultData);
    }

    // Helper methods to get repositories
    getUserRepo() {
        return this.connection.getRepository(User);
    }

    async getUsers() {
        const userRepo = this.getUserRepo();
        return await userRepo.find();
    }

    getTenantRepo() {
        return this.connection.getRepository(Tenant);
    }

    async getTenants() {
        const tenantRepo = this.getTenantRepo();
        return await tenantRepo.find();
    }
}
