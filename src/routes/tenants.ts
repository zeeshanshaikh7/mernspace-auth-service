import { Router } from 'express';

const tenantRouter = Router();

tenantRouter.post('/', (req, res) => {
    res.status(201).json({});
});

export default tenantRouter;
