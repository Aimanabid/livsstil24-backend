import express from 'express';
import { getAll, update } from './settings.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/',  getAll);
router.put('/',  authMiddleware, update);

export default router;
