import express from 'express';
import { getOverview, getDetails } from './stats.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard/overview', authMiddleware, getOverview);
router.get('/dashboard/details',  authMiddleware, getDetails);

export default router;
