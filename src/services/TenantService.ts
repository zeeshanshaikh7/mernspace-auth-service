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
}
