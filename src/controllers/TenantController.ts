import { NextFunction, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info(`Tenant has been created: ${tenant.id}`, {
                tenant,
            });

            res.status(201).json(tenant);
        } catch (error) {
            this.logger.error('Error creating tenant', { error });
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal Server Error'));
            }
        }
    }
}
