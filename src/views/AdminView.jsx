import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Package, 
  Truck, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Search,
  Check,
  Star,
  ThumbsUp,
  X
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminView({ onBackToStorefront }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, inventory, reviews
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    tagline: '',
    category: 'Industrial & Coatings',
    price: 35.00,
    sku: 'AERO-NEW-500',
    volume: '500ml (16.9 fl oz)',
    stockCount: 200,
    lowStockThreshold: 40,
    propellant: 'Eco-HFO 1234ze',
    pressureBar: 7.0,
    optimalDistance: '20 - 25 cm',
    voc: '< 2.0% CARB Compliant',
    description: 'Commercial grade aerosol formulation engineered for industrial durability.',
    features: ['High-Strength Surface Bond', 'Zero-ODP Eco-Propellant', '360° All-Angle Valve']
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes, invRes, revRes] = await Promise.all([
        api.getStats(),
        api.getProducts(),
        api.getOrders(),
        api.getInventory(),
        api.getReviews(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (ordRes.success) setOrders(ordRes.data);
      if (invRes.success) setInventory(invRes.data);
      if (revRes.success) setReviews(revRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProduct(newProduct);
      if (res.success) {
        setProducts([res.data, ...products]);
        setIsAddingProduct(false);
        alert('New aerosol SKU created and added to catalog.');
      }
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product SKU?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const handleReplenishStock = async (productId, addQty = 100) => {
    try {
      const res = await api.updateStock(productId, { addStock: addQty });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to replenish stock');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await api.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="site-container" style={{ padding: '36px 0 80px' }}>
      
      {/* Admin Header */}
      <div 
        className="card-clean"
        style={{
          padding: '24px 28px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                AEROVOX™ Commercial Admin Portal
              </h1>
              <span className="badge badge-accent" style={{ backgroundColor: 'rgba(2, 132, 199, 0.3)', color: '#38bdf8' }}>
                Super Admin
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              Real-time catalog management, HazMat order fulfillment, and cleanroom inventory ledger.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchAdminData} className="btn btn-secondary btn-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Telemetry</span>
          </button>
          <button onClick={onBackToStorefront} className="btn btn-accent btn-sm">
            <span>Return to Storefront</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '28px', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', name: 'KPI Overview', icon: Activity },
          { id: 'products', name: `Products Catalog (${products.length})`, icon: Layers },
          { id: 'orders', name: `Orders Ledger (${orders.length})`, icon: Truck },
          { id: 'inventory', name: 'Inventory & Restock', icon: Package },
          { id: 'reviews', name: `Reviews Moderation (${reviews.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.9375rem',
                border: '1px solid transparent',
                borderBottomColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} color={activeTab === tab.id ? '#0284c7' : 'currentColor'} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div className="card-clean" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Gross Revenue (MTD)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '6px 0' }}>{stats.totalRevenue}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>{stats.monthlyGrowth} vs Previous Month</div>
            </div>

            <div className="card-clean" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Canisters Packaged</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-accent)', margin: '6px 0' }}>{stats.canistersFilledMtd}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-brand-accent)', fontWeight: 600 }}>{stats.pressureIntegrityRate} Pressure Pass Rate</div>
            </div>

            <div className="card-clean" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Available Stock Units</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '6px 0' }}>{stats.inventoryAvailable?.toLocaleString()}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Across {stats.activeSkus} Active SKUs</div>
            </div>

            <div className="card-clean" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Compliance Rating</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)', margin: '6px 0' }}>100% Low-VOC</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-success)' }}>CARB 2026 & UN1950 Certified</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products Catalog Management */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
              Active Aerosol Catalog SKUs ({products.length})
            </h2>

            <button onClick={() => setIsAddingProduct(true)} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add New Aerosol SKU</span>
            </button>
          </div>

          {/* Add Product Modal */}
          {isAddingProduct && (
            <div className="modal-backdrop" onClick={() => setIsAddingProduct(false)}>
              <div className="modal-box" style={{ maxWidth: '560px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Add New Product SKU</h3>
                  <button onClick={() => setIsAddingProduct(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="CERAMAX 9H Clear Coat"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="form-input"
                      >
                        <option value="Automotive & Marine">Automotive & Marine</option>
                        <option value="Electronics & Precision">Electronics & Precision</option>
                        <option value="Industrial & Coatings">Industrial & Coatings</option>
                        <option value="Sanitization & Medical">Sanitization & Medical</option>
                        <option value="Art & Specialty">Art & Specialty</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">MSRP Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label">Initial Stock Units</label>
                      <input
                        type="number"
                        value={newProduct.stockCount}
                        onChange={(e) => setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value, 10) })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Pressure (BAR)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.pressureBar}
                        onChange={(e) => setNewProduct({ ...newProduct, pressureBar: parseFloat(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Propellant Type</label>
                    <input
                      type="text"
                      value={newProduct.propellant}
                      onChange={(e) => setNewProduct({ ...newProduct, propellant: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                    Publish to Catalog
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="card-clean" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px' }}>SKU & Name</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock Units</th>
                  <th style={{ padding: '12px 16px' }}>Pressure</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: 'var(--color-brand-primary)' }}>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{p.category}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${p.stockCount <= 40 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stockCount} units
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{p.pressureBar} BAR</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Ledger */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)', marginBottom: '20px' }}>
            HazMat Orders & Cleanroom Fulfillment Ledger
          </h2>

          <div className="card-clean" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Customer / Facility</th>
                  <th style={{ padding: '12px 16px' }}>Items</th>
                  <th style={{ padding: '12px 16px' }}>Total</th>
                  <th style={{ padding: '12px 16px' }}>Current Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                      {ord.id}
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{ord.trackingNumber}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{ord.customer?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.customer?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{ord.items?.length || 0} SKU item(s)</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>${ord.total.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${ord.status === 'Delivered' ? 'badge-success' : 'badge-accent'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                      >
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Inventory & Restock */}
      {activeTab === 'inventory' && inventory && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                Cleanroom Stock Ledger & Restock Thresholds
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                Total Warehouse Valuation: <strong>{inventory.totalValuation}</strong> ({inventory.totalUnits} Canisters)
              </p>
            </div>
          </div>

          <div className="card-clean" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px' }}>SKU & Name</th>
                  <th style={{ padding: '12px 16px' }}>Stock Level</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Valuation</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Replenish Batch</th>
                </tr>
              </thead>
              <tbody>
                {inventory.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{item.stockCount} units</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${item.status === 'Low Stock' ? 'badge-warning' : item.status === 'Out of Stock' ? 'badge-error' : 'badge-success'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>${item.totalValuation}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleReplenishStock(item.id, 100)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Plus size={12} />
                        <span>Restock +100 Cans</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)', marginBottom: '20px' }}>
            Customer Reviews Moderation Queue
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="card-clean" style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-brand-primary)' }}>{rev.customerName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({rev.role})</span>
                    <div style={{ display: 'flex', gap: '2px', color: '#d97706' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} fill="#d97706" color="#d97706" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-error)' }}
                  title="Remove review"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
