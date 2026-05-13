import express from 'express';
import { getAll, getById, create, update, remove } from './customer.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
