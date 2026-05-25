import express from 'express';
import { getAll, create, update, remove } from './users.controller.js';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

router.get('/',       authMiddleware, adminOnly, getAll);
router.post('/',      authMiddleware, adminOnly, create);
router.put('/:id',    authMiddleware, adminOnly, update);
router.delete('/:id', authMiddleware, adminOnly, remove);

export default router;
