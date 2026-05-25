import express from 'express';
import { getAll, create, update, remove } from './category.controller.js';
import { authMiddleware, editorOrAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getAll);
router.post('/', authMiddleware, editorOrAdmin, create);
router.put('/:id', authMiddleware, editorOrAdmin, update);
router.delete('/:id', authMiddleware, editorOrAdmin, remove);

export default router;
