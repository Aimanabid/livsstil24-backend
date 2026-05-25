import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import sequelize from './config/db.js';
import './models/index.js'; // register all models + associations

import authRoutes     from './modules/auth/auth.router.js';
import articleRoutes  from './modules/articles/article.router.js';
import adRoutes       from './modules/ads/ad.router.js';
import statsRoutes    from './modules/stats/stats.router.js';
import uploadRoutes   from './modules/upload/upload.router.js';
import customerRoutes from './modules/customers/customer.router.js';
import categoryRoutes  from './modules/categories/category.router.js';
import settingsRoutes  from './modules/settings/settings.router.js';
import usersRoutes     from './modules/users/users.router.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads')));

app.use('/api/auth',       authRoutes);
app.use('/api/articles',   articleRoutes);
app.use('/api/ads',        adRoutes);
app.use('/api/stats',      statsRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/users',     usersRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    app.listen(PORT, () => console.log(`🚀 Livsstil24 API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();
export default app;
