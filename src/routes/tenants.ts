import { Roles } from './../constants/index';
import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { TenantService } from './../services/TenantService';

const tenantRouter = Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

tenantRouter.post('/', authenticate, canAccess(Roles.ADMIN), (req, res, next) =>
    tenantController.create(req, res, next),
);

export default tenantRouter;
