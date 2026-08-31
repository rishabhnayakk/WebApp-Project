import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import HomeView from './views/HomeView';
import ShopView from './views/ShopView';
import ProductDetailView from './views/ProductDetailView';
import WishlistView from './views/WishlistView';
import CheckoutView from './views/CheckoutView';
import OrderTrackingView from './views/OrderTrackingView';
import AccountView from './views/AccountView';
import AboutView from './views/AboutView';
import ContactView from './views/ContactView';
import FAQView from './views/FAQView';
import AdminView from './views/AdminView';

import { api } from './utils/api';
import { CheckCircle2, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart State (synced with localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aerovox_cart');
      return saved ? JSON.parse(saved) : [
        {
          id: 'aero-ceramax-pro',
          name: 'CERAMAX™ 9H Nano-Ceramic Aerosol Clear Coat',
          sku: 'AERO-CRM-500',
          price: 49.99,
          quantity: 2,
          volume: '500ml (16.9 fl oz)',
          color: '#0284c7'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Wishlist State (synced with localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aerovox_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Auth User State (Defaults to demo B2B customer session)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aerovox_user');
      return saved ? JSON.parse(saved) : {
        id: 'usr-101',
        name: 'Dr. Marcus Sterling',
        email: 'm.sterling@novaaero.com',
        role: 'customer_b2b',
        company: 'NovaAero Dynamics LLC',
        tier: 'B2B Enterprise Gold',
        phone: '+1 (206) 555-0182',
        addresses: [
          {
            id: 'addr-1',
            isDefault: true,
            type: 'Commercial Hangar',
            name: 'Dr. Marcus Sterling',
            company: 'NovaAero Dynamics',
            street: '740 Aerospace Blvd, Hangar 4B',
            city: 'Seattle',
            state: 'WA',
            zip: '98108',
          }
        ]
      };
    } catch (e) {
      return null;
    }
  });

  // UI Modal & Toast States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync states to storage
  useEffect(() => {
    try {
      localStorage.setItem('aerovox_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aerovox_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('aerovox_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  // Load products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      }
    };
    loadData();
  }, []);

  // Global Keyboard Shortcuts (e.g. Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            sku: product.sku || 'AERO-SKU',
            price: product.price,
            quantity: quantity,
            volume: product.volume,
            color: product.color || '#0284c7',
          },
        ];
      }
    });
    showToast(`Added ${quantity}x "${product.name}" to cart!`);
  };

  const handleAddToWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.name}" from wishlist.`);
    } else {
      setWishlist([...wishlist, product]);
      showToast(`Saved "${product.name}" to wishlist.`);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlist(wishlist.filter((item) => item.id !== productId));
  };

  const handleUpdateCartQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReorder = (items = []) => {
    setCart(items.map(item => ({ ...item, quantity: item.quantity || 1 })));
    setIsCartOpen(true);
    showToast('Items loaded into cart for reorder.');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out successfully.');
    if (currentView === 'account' || currentView === 'admin') {
      setCurrentView('home');
    }
  };

  const wishlistMap = wishlist.reduce((acc, p) => ({ ...acc, [p.id]: true }), {});
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        categories={categories}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            wishlistIds={wishlistMap}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={products}
            categories={categories}
            initialCategory={viewParams.category || 'All'}
            initialSearch={viewParams.search || ''}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            wishlistIds={wishlistMap}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBackToShop={() => handleNavigate('shop')}
            onAddToCart={handleAddToCart}
            onBuyNow={() => handleNavigate('checkout')}
            onAddToWishlist={handleAddToWishlist}
            isWishlisted={!!wishlistMap[selectedProduct.id]}
            onSelectRelatedProduct={handleSelectProduct}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            appliedCoupon={appliedCoupon}
            currentUser={currentUser}
            onOrderComplete={(order) => {
              setCart([]);
              setAppliedCoupon(null);
              showToast(`Order ${order.orderNumber} placed successfully!`);
            }}
          />
        )}

        {currentView === 'track' && (
          <OrderTrackingView
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            currentUser={currentUser}
            orders={[]}  
            wishlist={wishlist}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'contact' && (
          <ContactView />
        )}

        {currentView === 'faq' && (
          <FAQView />
        )}

        {currentView === 'admin' && (
          <AdminView
            onBackToStorefront={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => handleNavigate('checkout')}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      {/* Predictive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
        onSearchAll={(term) => handleNavigate('shop', { search: term })}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
