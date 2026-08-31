import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFilePath = path.join(__dirname, '../data/products.json');

// In-memory orders ledger with rich initial history
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
      { id: 'aero-ceramax-pro', name: 'CERAMAX™ 9H Nano-Ceramic Clear Coat', quantity: 12, price: 44.99, volume: '500ml' },
      { id: 'aero-syn-lube', name: 'TRIBO-SYNTH™ Graphene Micro-Film', quantity: 24, price: 22.50, volume: '500ml' },
    ],
    subtotal: 1079.88,
    discount: 161.98,
    shipping: 0,
    tax: 82.61,
    total: 1000.51,
    paymentMethod: 'Commercial Net-30 Invoice',
    paymentStatus: 'Approved / Pending Net-30',
    status: 'In Transit',
    trackingNumber: 'TRK-AERO-8839201-US',
    carrier: 'HazMat Freight Direct',
    placedAt: '2026-08-28T14:20:00Z',
    estimatedDelivery: '2026-09-02T16:00:00Z',
    timeline: [
      { status: 'Order Placed', time: 'Aug 28, 2:20 PM', completed: true },
      { status: 'Cleanroom Pressurization & QA', time: 'Aug 28, 5:40 PM', completed: true },
      { status: 'HazMat Freight Picked Up', time: 'Aug 29, 9:15 AM', completed: true },
      { status: 'In Transit to Destination Hub', time: 'Aug 30, 11:30 AM', completed: true },
      { status: 'Out for Final Delivery', time: 'Expected Sept 2', completed: false },
      { status: 'Delivered & Signed', time: 'Pending', completed: false },
    ],
  },
  {
    id: 'AERO-99419',
    customer: {
      name: 'Elena Rostova',
      email: 'elena.rostova@hypersonicdetailing.com',
      company: 'HyperSonic Detailing Studio',
      tier: 'Pro Specialist',
      address: '1240 Bayview Industrial Way, Los Angeles, CA 90021',
    },
    items: [
      { id: 'aero-chroma-shift', name: 'SPECTRUM-X™ Prism-Shift Coating', quantity: 4, price: 42.00, volume: '400ml' },
      { id: 'aero-corrosion-guard', name: 'MARINEX™ Cavity Wax & Salt-Shield', quantity: 2, price: 32.50, volume: '500ml' },
    ],
    subtotal: 233.00,
    discount: 23.30,
    shipping: 0,
    tax: 18.87,
    total: 228.57,
    paymentMethod: 'Credit Card (•••• 4242)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    trackingNumber: 'TRK-AERO-7719283-US',
    carrier: 'Priority HazMat Ground',
    placedAt: '2026-08-25T10:00:00Z',
    estimatedDelivery: '2026-08-28T14:30:00Z',
    timeline: [
      { status: 'Order Placed', time: 'Aug 25, 10:00 AM', completed: true },
      { status: 'Cleanroom Pressurization & QA', time: 'Aug 25, 1:15 PM', completed: true },
      { status: 'HazMat Freight Picked Up', time: 'Aug 26, 8:45 AM', completed: true },
      { status: 'In Transit', time: 'Aug 27, 2:00 PM', completed: true },
      { status: 'Out for Final Delivery', time: 'Aug 28, 9:00 AM', completed: true },
      { status: 'Delivered & Signed', time: 'Aug 28, 2:18 PM (Signed: E. Rostova)', completed: true },
    ],
  }
];

const PROMO_CODES = {
  'AEROVOX10': { discountPercent: 10, minSpend: 0, desc: '10% Launch Discount' },
  'BULK20': { discountPercent: 20, minSpend: 200, desc: '20% Volume Tier ($200+ min)' },
  'HAZMATFREE': { discountPercent: 0, freeShipping: true, desc: 'Free HazMat Certified Ground Shipping' },
  'VIPAERO': { discountPercent: 25, minSpend: 300, desc: '25% VIP Industrial Access' },
};

// POST /api/v1/orders/validate-coupon
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
      message: `Minimum spend of $${promo.minSpend} required for promo code ${code.toUpperCase()}.`,
    });
  }

  res.json({
    success: true,
    data: {
      code: code.toUpperCase().trim(),
      ...promo,
    },
  });
});

import { idempotencyLock } from '../middleware/securityMiddleware.js';

// POST /api/v1/orders (Create order + Deduct inventory stock with Idempotency Concurrency Lock)
router.post('/', idempotencyLock, (req, res) => {
  const { customer, items, subtotal, discount = 0, shipping = 0, tax = 0, paymentMethod, couponCode } = req.body;

  if (!customer || !customer.email || !items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'Customer details and cart items are required.',
    });
  }

  // Deduct inventory from products.json
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
    console.error('Error updating product inventory:', err);
  }

  const newOrderId = `AERO-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingNumber = `TRK-AERO-${Math.floor(1000000 + Math.random() * 9000000)}-US`;
  const grandTotal = Math.max(0, Number(subtotal) - Number(discount) + Number(shipping) + Number(tax));

  const newOrder = {
    id: newOrderId,
    customer,
    items,
    subtotal: Number(subtotal),
    discount: Number(discount),
    shipping: Number(shipping),
    tax: Number(tax),
    total: Number(grandTotal.toFixed(2)),
    paymentMethod: paymentMethod || 'Credit Card (Encrypted)',
    paymentStatus: paymentMethod === 'invoice' ? 'Net-30 Authorized' : 'Paid / Confirmed',
    couponCode: couponCode || null,
    status: 'Processing',
    trackingNumber,
    carrier: 'AeroVox HazMat Global Freight',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    timeline: [
      { status: 'Order Placed & Payment Authorized', time: 'Just now', completed: true },
      { status: 'Cleanroom Pressurization & QA Scan', time: 'Scheduled in 2 hours', completed: false },
      { status: 'HazMat Freight Picked Up', time: 'Scheduled Tomorrow, 9:00 AM', completed: false },
      { status: 'In Transit', time: 'Pending', completed: false },
      { status: 'Out for Final Delivery', time: 'Pending', completed: false },
      { status: 'Delivered & Signed', time: 'Pending', completed: false },
    ],
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created and scheduled for pressurized cleanroom packaging',
    data: newOrder,
  });
});

// GET /api/v1/orders (List all orders)
router.get('/', (req, res) => {
  const { email } = req.query;
  let result = orders;
  if (email) {
    result = orders.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase());
  }
  res.json({
    success: true,
    count: result.length,
    data: result,
  });
});

// GET /api/v1/orders/:id (Lookup order or tracking)
router.get('/:id', (req, res) => {
  const q = req.params.id.toLowerCase().trim();
  const order = orders.find(
    (o) => o.id.toLowerCase() === q || o.trackingNumber.toLowerCase() === q
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order or tracking ID not found' });
  }

  res.json({ success: true, data: order });
});

// PUT /api/v1/orders/:id/status (Admin: Update status)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

export default router;
