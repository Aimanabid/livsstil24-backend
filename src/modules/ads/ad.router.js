import express from 'express';
import { getByPlacement, trackImpression, trackClick, getAll, getPlacements, createPlacement, updatePlacement, create, update, remove } from './ad.controller.js';
import { authMiddleware, optionalAuth, adManagerOrAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/placement/:key', getByPlacement);
router.post('/:id/impression', optionalAuth, trackImpression);
router.post('/:id/click', optionalAuth, trackClick);

// Admin
router.get('/', authMiddleware, adManagerOrAdmin, getAll);
router.get('/placements', authMiddleware, adManagerOrAdmin, getPlacements);
router.post('/placements', authMiddleware, adManagerOrAdmin, createPlacement);
router.put('/placements/:id', authMiddleware, adManagerOrAdmin, updatePlacement);
router.post('/', authMiddleware, adManagerOrAdmin, create);
router.put('/:id', authMiddleware, adManagerOrAdmin, update);
router.delete('/:id', authMiddleware, adManagerOrAdmin, remove);

export default router;
