import express from 'express';
import { login, logout, getMe, updateMe, updatePassword } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.put('/password', authMiddleware, updatePassword);

export default router;
