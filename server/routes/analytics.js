import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFilePath = path.join(__dirname, '../data/products.json');

// In-memory B2B custom quote requests
const b2bQuotes = [
  {
    id: 'QUOTE-9041',
    company: 'Vanguard Aerospace LLC',
    contact: 'Dr. Marcus Vance (m.vance@vanguard-aero.com)',
    canisterSize: '500ml Heavy Aluminum',
    propellant: 'Eco-HFO 1234ze (Ultra Low GWP)',
    valveType: '360° All-Angle Ball Valve',
    quantity: 10000,
    estimatedUnitCost: '$3.45 / unit',
    totalEstimate: '$34,500.00',
    requestedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Engineering Review',
  },
  {
    id: 'QUOTE-9040',
    company: 'HyperSonic Detailing Pro',
    contact: 'Sarah Jenkins (sarah@hypersonicdetailing.com)',
    canisterSize: '400ml Tinplate Gloss',
    propellant: 'Purified N2 Micro-Jet',
    valveType: 'Variable Fan Atomizer',
    quantity: 2500,
    estimatedUnitCost: '$4.10 / unit',
    totalEstimate: '$10,250.00',
    requestedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Quote Sent',
  }
];

// GET /api/analytics/stats
router.get('/stats', (req, res) => {
  let products = [];
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    products = JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
  }

  const totalInventory = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const avgRating = (products.reduce((acc, p) => acc + p.rating, 0) / (products.length || 1)).toFixed(2);
  const totalSkus = products.length;

  res.json({
    success: true,
    data: {
      totalRevenue: '$148,920.00',
      monthlyGrowth: '+28.4%',
      canistersFilledMtd: '42,850 units',
      inventoryAvailable: totalInventory,
      activeSkus: totalSkus,
      avgCustomerSatisfaction: `${avgRating} / 5.0`,
      lowVocComplianceRate: '100% CARB & EU Compliant',
      activeB2BContracts: 38,
      b2bQuotesCount: b2bQuotes.length,
      serverUptime: '99.98% (Cleanroom Automated IoT)',
      pressureIntegrityRate: '99.994%',
    },
  });
});

// POST /api/analytics/custom-quote
router.post('/custom-quote', (req, res) => {
  const {
    company,
    contactName,
    email,
    phone,
    canisterSize,
    propellant,
    valveType,
    quantity,
    specialRequirements,
  } = req.body;

  if (!company || !email || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Company, work email, and estimated volume quantity are required.',
    });
  }

  const qty = parseInt(quantity, 10) || 1000;
  
  // Calculate dynamic contract estimate
  let baseUnit = 5.50;
  if (qty >= 10000) baseUnit = 3.20;
  else if (qty >= 5000) baseUnit = 3.80;
  else if (qty >= 2500) baseUnit = 4.30;
  
  if (propellant?.includes('HFO')) baseUnit += 0.40;
  if (valveType?.includes('360')) baseUnit += 0.25;

  const total = (baseUnit * qty).toFixed(2);
  const quoteId = `QUOTE-${Math.floor(1000 + Math.random() * 9000)}`;

  const newQuote = {
    id: quoteId,
    company,
    contact: `${contactName || 'Valued Partner'} (${email})`,
    phone: phone || 'N/A',
    canisterSize: canisterSize || '500ml Heavy Aluminum',
    propellant: propellant || 'Eco-HFO 1234ze',
    valveType: valveType || '360° All-Angle Ball Valve',
    quantity: qty,
    estimatedUnitCost: `$${baseUnit.toFixed(2)} / unit`,
    totalEstimate: `$${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    specialRequirements: specialRequirements || 'Standard formulation',
    requestedAt: new Date().toISOString(),
    status: 'In Engineering Review',
  };

  b2bQuotes.unshift(newQuote);

  res.status(201).json({
    success: true,
    message: 'Contract formulation estimate generated successfully! An aerosol chemical engineer will review your specs.',
    data: newQuote,
  });
});

// GET /api/analytics/quotes
router.get('/quotes', (req, res) => {
  res.json({
    success: true,
    count: b2bQuotes.length,
    data: b2bQuotes,
  });
});

export default router;
