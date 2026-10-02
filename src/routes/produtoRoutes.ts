import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';

const router = Router();

// Mapeamento dos verbos HTTP para os métodos do controller
router.get('/', ProdutoController.index);
router.get('/:id', ProdutoController.show);
router.post('/', ProdutoController.create);
router.put('/:id', ProdutoController.update);
router.delete('/:id', ProdutoController.delete);

export { router as produtoRoutes };
