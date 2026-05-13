import express from 'express';
import { getPublished, getBySlug, getAllAdmin, getByIdAdmin, create, update, remove } from './article.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getPublished);
router.get('/:slug', getBySlug);

// Admin
router.get('/admin/all', authMiddleware, getAllAdmin);
router.get('/admin/:id', authMiddleware, getByIdAdmin);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
