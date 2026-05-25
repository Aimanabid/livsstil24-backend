import express from 'express';
import { getAll, update } from './settings.controller.js';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

router.get('/',  getAll);
router.put('/',  authMiddleware, adminOnly, update);

export default router;
