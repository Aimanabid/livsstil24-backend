import express from 'express';
import { getByPlacement, trackImpression, trackClick, getAll, getPlacements, createPlacement, updatePlacement, create, update, remove } from './ad.controller.js';
import { authMiddleware, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/placement/:key', getByPlacement);
router.post('/:id/impression', optionalAuth, trackImpression);
router.post('/:id/click', optionalAuth, trackClick);

// Admin
router.get('/', authMiddleware, getAll);
router.get('/placements', authMiddleware, getPlacements);
router.post('/placements', authMiddleware, createPlacement);
router.put('/placements/:id', authMiddleware, updatePlacement);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
