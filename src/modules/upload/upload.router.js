import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadSingle, uploadMultiple } from './upload.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const uploadsDir = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Endast bilder tillåts'));
  },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Endast videofiler tillåts'));
  },
});

router.post('/',         authMiddleware, imageUpload.single('file'),  uploadSingle);
router.post('/multiple', authMiddleware, imageUpload.array('files', 10), uploadMultiple);
router.post('/video',    authMiddleware, videoUpload.single('file'),  uploadSingle);

export default router;
