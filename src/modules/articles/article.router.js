import express from 'express';
import { getPublished, getBySlug, trackView, getAllAdmin, getByIdAdmin, create, update, remove } from './article.controller.js';
import { authMiddleware, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getPublished);
router.get('/:slug', getBySlug);
router.post('/:slug/view', optionalAuth, trackView);

// Admin
router.get('/admin/all', authMiddleware, getAllAdmin);
router.get('/admin/:id', authMiddleware, getByIdAdmin);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
