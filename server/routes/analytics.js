import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFilePath = path.join(__dirname, '../data/products.json');

// ─── Sample B2B Quotes (in-memory store) ─────────────────────────────────────

const b2bQuotes = [
  {
    id: 'QUOTE-9041',
    company: 'Vanguard Aerospace LLC',
    contact: 'Dr. Marcus Vance (m.vance@vanguard-aero.com)',
    canisterSize: '500ml Heavy Aluminum',
    propellant: 'Eco-HFO 1234ze',
    valveType: '360° All-Angle Ball Valve',
    quantity: 10000,
    estimatedUnitCost: '₹340 / unit',
    totalEstimate: '₹34,00,000',
    requestedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Under Review',
  },
  {
    id: 'QUOTE-9040',
    company: 'HyperSonic Detailing Pro',
    contact: 'Sarah Jenkins (sarah@hypersonicdetailing.com)',
    canisterSize: '400ml Tinplate Gloss',
    propellant: 'Purified N2 Micro-Jet',
    valveType: 'Variable Fan Atomizer',
    quantity: 2500,
    estimatedUnitCost: '₹410 / unit',
    totalEstimate: '₹10,25,000',
    requestedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Quote Sent',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
};

/** Returns per-unit price based on order quantity tier. */
const getUnitRate = (qty) => {
  if (qty >= 10000) return 320;
  if (qty >= 5000) return 380;
  if (qty >= 2500) return 410;
  return 450;
};

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  const products = getProducts();
  const totalInventory = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const avgRating = (products.reduce((acc, p) => acc + p.rating, 0) / (products.length || 1)).toFixed(2);

  res.json({
    success: true,
    data: {
      totalRevenue: '₹14,89,200',
      monthlyGrowth: '+28.4%',
      canistersFilledMtd: '42,850 units',
      inventoryAvailable: totalInventory,
      activeSkus: products.length,
      avgCustomerSatisfaction: `${avgRating} / 5.0`,
      lowVocComplianceRate: '100% CARB & EU Compliant',
      activeB2BContracts: 38,
      b2bQuotesCount: b2bQuotes.length,
      serverUptime: '99.98%',
    },
  });
});

router.post('/custom-quote', (req, res) => {
  const { company, contactName, email, phone, canisterSize, propellant, valveType, quantity, specialRequirements } = req.body;

  if (!company || !email || !quantity) {
    return res.status(400).json({ success: false, message: 'Company, contact email, and quantity are required.' });
  }

  const qty = parseInt(quantity, 10) || 1000;
  const baseUnit = getUnitRate(qty);
  const total = baseUnit * qty;
  const quoteId = `QUOTE-${Math.floor(1000 + Math.random() * 9000)}`;

  const newQuote = {
    id: quoteId,
    company,
    contact: `${contactName || 'Client'} (${email})`,
    phone: phone || 'N/A',
    canisterSize: canisterSize || '500ml Heavy Aluminum',
    propellant: propellant || 'Eco-HFO 1234ze',
    valveType: valveType || '360° All-Angle Ball Valve',
    quantity: qty,
    estimatedUnitCost: `₹${baseUnit} / unit`,
    totalEstimate: `₹${total.toLocaleString('en-IN')}`,
    specialRequirements: specialRequirements || 'None',
    requestedAt: new Date().toISOString(),
    status: 'In Review',
  };

  b2bQuotes.unshift(newQuote);
  res.status(201).json({
    success: true,
    message: 'Quote request submitted successfully. Our team will review your specifications.',
    data: newQuote,
  });
});

router.get('/quotes', (req, res) => {
  res.json({ success: true, count: b2bQuotes.length, data: b2bQuotes });
});

export default router;
