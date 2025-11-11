import { NextFunction, Response, Request } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
import { TenantQueryParams, TenantRequestBody } from '../types';
import { matchedData, validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}

    async create(req: TenantRequestBody, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                error: 'Validation error',
                errors: result.array(),
            });
            return;
        }

        this.logger.debug('new request to create a tenant', {
            name,
            address,
        });

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

    async getAll(req: Request, res: Response, next: NextFunction) {
        this.logger.debug('new request to get all tenants');

        const validatedQuery = matchedData(req, { onlyValidData: true });

        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams,
            );

            this.logger.info('All tenant have been fetched');
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });
        } catch (error) {
            this.logger.error('Error retrieving tenants', { error });
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal Server Error'));
            }
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        this.logger.debug(`new request to get tenant by id: ${id}`);

        try {
            const tenant = await this.tenantService.findById(Number(id));
            if (!tenant) {
                this.logger.warn(`Tenant not found: ${id}`);
                return next(createHttpError(404, 'Tenant not found'));
            }

            this.logger.info(`Tenant has been retrieved: ${tenant.id}`, {
                tenant,
            });

            res.status(200).json(tenant);
        } catch (error) {
            this.logger.error('Error retrieving tenant', { error });
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal Server Error'));
            }
        }
    }

    async update(req: TenantRequestBody, res: Response, next: NextFunction) {
        const { id } = req.params;
        const tenantData = req.body;

        this.logger.debug(`new request to update tenant: ${id}`, tenantData);

        try {
            const tenant = await this.tenantService.update(
                Number(id),
                tenantData,
            );

            this.logger.info(`Tenant has been updated: ${tenant.id}`, {
                tenant,
            });

            res.status(200).json(tenant);
        } catch (error) {
            this.logger.error('Error updating tenant', { error });
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal Server Error'));
            }
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        this.logger.debug(`new request to delete tenant: ${id}`);

        try {
            const tenant = await this.tenantService.delete(Number(id));
            if (!tenant) {
                this.logger.warn(`Tenant not found: ${id}`);
                return next(createHttpError(404, 'Tenant not found'));
            }

            this.logger.info(`Tenant has been deleted: ${tenant.id}`, {
                tenant,
            });

            res.status(204).send();
        } catch (error) {
            this.logger.error('Error deleting tenant', { error });
            if (error instanceof HttpError) {
                next(error);
            } else {
                next(createHttpError(500, 'Internal Server Error'));
            }
        }
    }
}
