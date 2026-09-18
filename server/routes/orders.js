import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { idempotencyLock } from '../middleware/securityMiddleware.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFilePath = path.join(__dirname, '../data/products.json');

// ─── Sample Orders (in-memory store) ─────────────────────────────────────────

const orders = [
  {
    id: 'AERO-99420',
    customer: {
      name: 'Dr. Marcus Sterling',
      email: 'm.sterling@novaaero.com',
      company: 'NovaAero Dynamics LLC',
      tier: 'B2B Enterprise Partner',
      address: '740 Aerospace Blvd, Hangar 4B, Seattle, WA 98108',
    },
    items: [
      { id: 'aero-ceramax-pro', name: 'CERAMAX™ 9H Nano-Ceramic Clear Coat', quantity: 12, price: 3999, volume: '500ml' },
      { id: 'aero-dielectric-max', name: 'VOLTX™ Precision Contact Cleaner', quantity: 6, price: 2299, volume: '400ml' },
    ],
    subtotal: 61782,
    discount: 6178,
    shipping: 0,
    tax: 9999,
    total: 65603,
    paymentMethod: 'Net-30 Invoice',
    paymentStatus: 'Approved / Pending Net-30',
    status: 'In Transit',
    trackingNumber: 'TRK-AERO-8839201-US',
    carrier: 'BlueDart Express Ground',
    placedAt: '2026-08-28T14:20:00Z',
    estimatedDelivery: '2026-09-02T16:00:00Z',
    timeline: [
      { status: 'Order Placed', time: 'Aug 28, 2:20 PM', completed: true },
      { status: 'Quality Inspection & Packing', time: 'Aug 28, 5:40 PM', completed: true },
      { status: 'Picked Up by Courier', time: 'Aug 29, 9:15 AM', completed: true },
      { status: 'In Transit', time: 'Aug 30, 11:30 AM', completed: true },
      { status: 'Out for Delivery', time: 'Expected Sept 2', completed: false },
      { status: 'Delivered', time: 'Pending', completed: false },
    ],
  },
  {
    id: 'AERO-99419',
    customer: {
      name: 'Elena Rostova',
      email: 'elena.rostova@hypersonic.com',
      company: 'HyperSonic Detailing Studio',
      tier: 'Pro Specialist',
      address: '1240 Bayview Industrial Way, Los Angeles, CA 90021',
    },
    items: [
      { id: 'aero-chroma-shift', name: 'SPECTRUM-X™ Prism-Shift Coating', quantity: 4, price: 3399, volume: '400ml' },
      { id: 'aero-corrosion-guard', name: 'MARINEX™ Cavity Wax & Salt-Shield', quantity: 2, price: 2599, volume: '500ml' },
    ],
    subtotal: 18794,
    discount: 1879,
    shipping: 0,
    tax: 3044,
    total: 19959,
    paymentMethod: 'Credit Card (•••• 4242)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    trackingNumber: 'TRK-AERO-7719283-US',
    carrier: 'Express Logistics',
    placedAt: '2026-08-25T10:00:00Z',
    estimatedDelivery: '2026-08-28T14:30:00Z',
    timeline: [
      { status: 'Order Placed', time: 'Aug 25, 10:00 AM', completed: true },
      { status: 'Quality Inspection & Packing', time: 'Aug 25, 1:15 PM', completed: true },
      { status: 'Picked Up by Courier', time: 'Aug 26, 8:45 AM', completed: true },
      { status: 'In Transit', time: 'Aug 27, 2:00 PM', completed: true },
      { status: 'Out for Delivery', time: 'Aug 28, 9:00 AM', completed: true },
      { status: 'Delivered', time: 'Aug 28, 2:18 PM', completed: true },
    ],
  },
];

const PROMO_CODES = {
  'AEROVOX10': { discountPercent: 10, minSpend: 0, desc: '10% Launch Discount' },
  'BULK20': { discountPercent: 20, minSpend: 15000, desc: '20% Volume Tier (₹15,000+ min)' },
  'HAZMATFREE': { discountPercent: 0, freeShipping: true, desc: 'Free Shipping' },
  'VIPAERO': { discountPercent: 25, minSpend: 25000, desc: '25% VIP Industrial Access' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v) => Number(v) || 0;

const generateOrderId = () => `AERO-${Math.floor(10000 + Math.random() * 90000)}`;
const generateTrackingNumber = () => `TRK-AERO-${Math.floor(1000000 + Math.random() * 9000000)}-IN`;

const buildOrderTimeline = () => [
  { status: 'Order Placed', time: 'Just now', completed: true },
  { status: 'Quality Inspection & Packing', time: 'Scheduled today', completed: false },
  { status: 'Picked Up by Courier', time: 'Scheduled tomorrow', completed: false },
  { status: 'In Transit', time: 'Pending', completed: false },
  { status: 'Out for Delivery', time: 'Pending', completed: false },
  { status: 'Delivered', time: 'Pending', completed: false },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/validate-coupon', (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Promo code required' });
  }

  const promo = PROMO_CODES[code.toUpperCase().trim()];
  if (!promo) {
    return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
  }

  if (promo.minSpend && subtotal < promo.minSpend) {
    return res.status(400).json({
      success: false,
      message: `Minimum spend of ₹${promo.minSpend} required for promo code ${code.toUpperCase()}.`,
    });
  }

  res.json({ success: true, data: { code: code.toUpperCase().trim(), ...promo } });
});

router.post('/', idempotencyLock, (req, res) => {
  const { customer, items, subtotal, discount = 0, shipping = 0, tax = 0, paymentMethod, couponCode } = req.body;

  if (!customer || !customer.email || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Customer details and cart items are required.' });
  }

  // Deduct inventory
  try {
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    const products = JSON.parse(productsData);
    for (const item of items) {
      const prod = products.find((p) => p.id === item.id);
      if (prod) {
        prod.stockCount = Math.max(0, (prod.stockCount || 50) - (item.quantity || 1));
        if (prod.stockCount === 0) prod.inStock = false;
      }
    }
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error updating inventory for order:', err);
  }

  const grandTotal = Math.max(0, toNum(subtotal) - toNum(discount) + toNum(shipping) + toNum(tax));

  const newOrder = {
    id: generateOrderId(),
    customer,
    items,
    subtotal: toNum(subtotal),
    discount: toNum(discount),
    shipping: toNum(shipping),
    tax: toNum(tax),
    total: Number(grandTotal.toFixed(2)),
    paymentMethod: paymentMethod || 'Online Payment',
    paymentStatus: paymentMethod === 'invoice' ? 'Net-30 Authorized' : 'Paid',
    couponCode: couponCode || null,
    status: 'Processing',
    trackingNumber: generateTrackingNumber(),
    carrier: 'Express Air Freight',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    timeline: buildOrderTimeline(),
  };

  orders.unshift(newOrder);
  res.status(201).json({ success: true, message: 'Order placed successfully.', data: newOrder });
});

router.get('/', (req, res) => {
  const { email } = req.query;
  const result = email
    ? orders.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase())
    : orders;
  res.json({ success: true, count: result.length, data: result });
});

router.get('/:id', (req, res) => {
  const q = req.params.id.toLowerCase().trim();
  const order = orders.find(
    (o) => o.id.toLowerCase() === q || o.trackingNumber.toLowerCase() === q
  );

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

export default router;
