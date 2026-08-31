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

// GET /api/v1/products (Advanced filtering, search, sorting, pagination)
router.get('/', (req, res) => {
  const { 
    category, 
    search, 
    minPrice, 
    maxPrice, 
    propellant, 
    volume, 
    inStockOnly, 
    minRating,
    sort, 
    page = 1, 
    limit = 20 
  } = req.query;

  let products = getProducts();

  // Category filter
  if (category && category !== 'All') {
    products = products.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Keyword Search
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  // Price range
  if (minPrice) {
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  }

  // Propellant type filter
  if (propellant && propellant !== 'All') {
    products = products.filter((p) => 
      p.propellant.toLowerCase().includes(propellant.toLowerCase())
    );
  }

  // Volume size filter
  if (volume && volume !== 'All') {
    products = products.filter((p) => 
      p.volume.toLowerCase().includes(volume.toLowerCase()) ||
      p.availableSizes?.some((s) => s.toLowerCase().includes(volume.toLowerCase()))
    );
  }

  // In stock only
  if (inStockOnly === 'true') {
    products = products.filter((p) => p.inStock && p.stockCount > 0);
  }

  // Minimum Rating
  if (minRating) {
    products = products.filter((p) => p.rating >= parseFloat(minRating));
  }

  // Sorting
  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  } else if (sort === 'reviews') {
    products.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'newest') {
    products.sort((a, b) => b.id.localeCompare(a.id));
  }

  const totalResults = products.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    count: totalResults,
    page: pageNum,
    totalPages: Math.ceil(totalResults / limitNum) || 1,
    data: paginatedProducts,
  });
});

// GET /api/v1/products/categories
router.get('/categories', (req, res) => {
  const products = getProducts();
  const categories = ['All', ...new Set(products.map((p) => p.category))];
  res.json({
    success: true,
    data: categories,
  });
});

// GET /api/v1/products/:id or slug
router.get('/:id', (req, res) => {
  const products = getProducts();
  const identifier = req.params.id.toLowerCase();
  const product = products.find(
    (p) => p.id.toLowerCase() === identifier || p.slug?.toLowerCase() === identifier
  );

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product SKU not found' });
  }

  // Find related products in same category
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  res.json({ success: true, data: product, related });
});

// POST /api/v1/products (Admin: Add new product SKU)
router.post('/', (req, res) => {
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.price || !newProduct.category) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
  }

  const products = getProducts();
  const id = newProduct.id || `aero-${Date.now()}`;
  const slug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const created = {
    id,
    slug,
    rating: 5.0,
    reviewCount: 0,
    inStock: true,
    stockCount: newProduct.stockCount || 100,
    lowStockThreshold: newProduct.lowStockThreshold || 25,
    badge: newProduct.badge || 'New Formula',
    color: newProduct.color || '#0284c7',
    features: newProduct.features || [],
    specifications: newProduct.specifications || {},
    sds: newProduct.sds || {},
    usageGuide: newProduct.usageGuide || [],
    ...newProduct,
  };

  products.unshift(created);
  saveProducts(products);

  res.status(201).json({ success: true, message: 'Aerosol SKU created successfully', data: created });
});

// PUT /api/v1/products/:id (Admin: Update product)
router.put('/:id', (req, res) => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products[index] = { ...products[index], ...req.body };
  saveProducts(products);

  res.json({ success: true, message: 'Product updated successfully', data: products[index] });
});

// DELETE /api/v1/products/:id (Admin: Delete product)
router.delete('/:id', (req, res) => {
  let products = getProducts();
  const exists = products.some((p) => p.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products = products.filter((p) => p.id !== req.params.id);
  saveProducts(products);

  res.json({ success: true, message: 'Product deleted successfully' });
});

export default router;
