import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFilePath = path.join(__dirname, '../data/products.json');

const getProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
};

const saveProducts = (products) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
};

// GET /api/v1/inventory (Stock ledger and low-stock warnings)
router.get('/', (req, res) => {
  const products = getProducts();
  const totalStock = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const lowStockItems = products.filter((p) => (p.stockCount || 0) <= (p.lowStockThreshold || 40));
  const outOfStockItems = products.filter((p) => (p.stockCount || 0) === 0);

  const inventoryLedger = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    stockCount: p.stockCount || 0,
    lowStockThreshold: p.lowStockThreshold || 40,
    status: (p.stockCount || 0) === 0 ? 'Out of Stock' : (p.stockCount || 0) <= (p.lowStockThreshold || 40) ? 'Low Stock' : 'In Stock',
    unitCost: (p.price * 0.42).toFixed(2),
    retailPrice: p.price,
    totalValuation: ((p.stockCount || 0) * p.price).toFixed(2),
  }));

  res.json({
    success: true,
    data: {
      totalUnits: totalStock,
      totalValuation: `$${inventoryLedger.reduce((sum, item) => sum + parseFloat(item.totalValuation), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      skuCount: products.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      items: inventoryLedger,
    },
  });
});

// PUT /api/v1/inventory/:id (Adjust stock / replenishment)
router.put('/:id', (req, res) => {
  const { stockCount, addStock } = req.body;
  const products = getProducts();
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (addStock !== undefined) {
    product.stockCount = Math.max(0, (product.stockCount || 0) + parseInt(addStock, 10));
  } else if (stockCount !== undefined) {
    product.stockCount = Math.max(0, parseInt(stockCount, 10));
  }

  product.inStock = product.stockCount > 0;
  saveProducts(products);

  res.json({
    success: true,
    message: `Inventory updated for ${product.name}. Current stock: ${product.stockCount} units.`,
    data: product,
  });
});

export default router;
