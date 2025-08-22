import { HttpError } from 'http-errors';
/* eslint-disable @typescript-eslint/no-unused-vars */
import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { TenantData } from '../types';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create({ name, address }: TenantData) {
        const tenant = await this.tenantRepository.findOne({ where: { name } });

        if (tenant) {
            const error = createHttpError(400, 'Tenant already exists');
            throw error;
        }

        try {
            return await this.tenantRepository.save({
                name,
                address,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }

    async getAll() {
        try {
            return await this.tenantRepository.find();
        } catch (error) {
            const httpError = createHttpError(
                500,
                'Failed to retrieve tenants from the database',
            );
            throw httpError;
        }
    }

    async findByName(name: string) {
        return await this.tenantRepository.findOne({ where: { name } });
    }

    async findById(id: number) {
        try {
            return await this.tenantRepository.findOne({ where: { id } });
        } catch (error) {
            const httpError = createHttpError(
                500,
                'Failed to retrieve tenant from the database',
            );
            throw httpError;
        }
    }

    async update(id: number, { name, address }: TenantData) {
        try {
            const tenant = await this.tenantRepository.findOne({
                where: { id },
            });

            if (!tenant) {
                const error = createHttpError(404, 'Tenant not found');
                throw error;
            }

            tenant.name = name;
            tenant.address = address;

            return await this.tenantRepository.save(tenant);
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw createHttpError(500, 'Internal Server Error');
            }
        }
    }

    async delete(id: number) {
        try {
            const tenant = await this.tenantRepository.findOne({
                where: { id },
            });
            if (!tenant) {
                const error = createHttpError(404, 'Tenant not found');
                throw error;
            }

            await this.tenantRepository.remove(tenant);
            return tenant;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw createHttpError(500, 'Internal Server Error');
            }
        }
    }
}
