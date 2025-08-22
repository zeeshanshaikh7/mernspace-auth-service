import { Roles } from './../constants/index';
import { NextFunction, Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { TenantService } from './../services/TenantService';
import { tenantValidator } from '../validators/tenantValidator';

const tenantRouter = Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

tenantRouter.post(
    '/',
    authenticate,
    canAccess(Roles.ADMIN),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

tenantRouter.get(
    '/',
    authenticate,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next),
);

tenantRouter.get(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getById(req, res, next),
);

tenantRouter.put(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);

tenantRouter.delete(
    '/:id',
    authenticate,
    canAccess(Roles.ADMIN),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.delete(req, res, next),
);

export default tenantRouter;
