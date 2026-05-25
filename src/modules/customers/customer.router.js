import express from 'express';
import { getAll, getById, create, update, remove } from './customer.controller.js';
import { authMiddleware, adManagerOrAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adManagerOrAdmin, getAll);
router.get('/:id', authMiddleware, adManagerOrAdmin, getById);
router.post('/', authMiddleware, adManagerOrAdmin, create);
router.put('/:id', authMiddleware, adManagerOrAdmin, update);
router.delete('/:id', authMiddleware, adManagerOrAdmin, remove);

export default router;
