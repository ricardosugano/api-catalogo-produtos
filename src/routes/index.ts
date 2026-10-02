import { Router } from 'express';
import { produtoRoutes } from './produtoRoutes';

const router = Router();

// Registra as rotas de produtos sob o prefixo /produtos
router.use('/produtos', produtoRoutes);

export { router as appRoutes };
