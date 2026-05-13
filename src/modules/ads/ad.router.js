import express from 'express';
import { getByPlacement, trackClick, getAll, getPlacements, createPlacement, updatePlacement, create, update, remove } from './ad.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

// Public
router.get('/placement/:key', getByPlacement);
router.post('/:id/click', trackClick);

// Admin
router.get('/', authMiddleware, getAll);
router.get('/placements', authMiddleware, getPlacements);
router.post('/placements', authMiddleware, createPlacement);
router.put('/placements/:id', authMiddleware, updatePlacement);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
