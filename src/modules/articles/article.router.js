import express from 'express';
import { getPublished, getBySlug, trackView, trackSiteVisit, getAllAdmin, getByIdAdmin, create, update, remove } from './article.controller.js';
import { authMiddleware, optionalAuth, editorOrAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getPublished);
router.post('/visit', trackSiteVisit);
router.get('/:slug', getBySlug);
router.post('/:slug/view', optionalAuth, trackView);

// Admin
router.get('/admin/all', authMiddleware, editorOrAdmin, getAllAdmin);
router.get('/admin/:id', authMiddleware, editorOrAdmin, getByIdAdmin);
router.post('/', authMiddleware, editorOrAdmin, create);
router.put('/:id', authMiddleware, editorOrAdmin, update);
router.delete('/:id', authMiddleware, editorOrAdmin, remove);

export default router;
