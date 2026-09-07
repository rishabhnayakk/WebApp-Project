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

// legacy v1 alias routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

app.post('/api/v1/contact', (req, res) => {
  res.json({
    success: true,
    message: 'Thanks for reaching out! We will get back to you shortly.',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  await connectDB();
});
