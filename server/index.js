import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import reviewsRouter from './routes/reviews.js';
import inventoryRouter from './routes/inventory.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public'), {
  extensions: ['html']
}));

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', (req, res, next) => {
  req.url = '/categories' + req.url;
  productsRouter(req, res, next);
});
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/settings', settingsRouter);

app.post('/api/v1/contact', (req, res) => {
  const { name, email, subject } = req.body;
  res.json({
    success: true,
    message: 'Thank you. Your message has been received by Engineering Support.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'E-Commerce Webapp Core v2.0',
    cleanroomIoT: 'ONLINE',
    pressureNormal: true,
    timestamp: new Date().toISOString(),
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Return JSON 404 for any unhandled API calls instead of serving HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint ${req.originalUrl} not found.` });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await connectDB();
});
