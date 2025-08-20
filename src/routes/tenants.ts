import { TenantService } from './../services/TenantService';
import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';

const tenantRouter = Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

tenantRouter.post('/', (req, res, next) =>
    tenantController.create(req, res, next),
);

export default tenantRouter;
