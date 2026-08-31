import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String },
  tagline: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  sku: { type: String },
  volume: { type: String },
  availableSizes: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 100 },
  lowStockThreshold: { type: Number, default: 20 },
  badge: { type: String, default: 'New Formula' },
  color: { type: String, default: '#0284c7' },
  propellant: { type: String },
  pressureBar: { type: Number },
  optimalDistance: { type: String },
  dryTime: { type: String },
  voc: { type: String },
  flammability: { type: String },
  description: { type: String },
  features: [{ type: String }],
  specifications: { type: Map, of: String },
  sds: {
    unNumber: { type: String, default: 'UN1950' },
    casNumber: { type: String },
    storageTemp: { type: String },
    ppe: { type: String },
    shelfLife: { type: String }
  },
  usageGuide: [{ type: String }]
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
