import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthImage from '../components/AuthImage';

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Available categories to cycle through (add more as your backend grows)
const CATEGORIES = ['dairy', 'spices', 'beverages', 'grains', 'snacks'];

const CategoryProductsStrip = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const scrollRef = useRef(null);
  const isAuthenticated = useSelector((state) => state.auth?.status);
  const navigate = useNavigate();

  // Discover which categories actually have products
  useEffect(() => {
    const probe = async () => {
      const found = [];
      for (const cat of CATEGORIES) {
        try {
          const res = await api.get(`/auth/api/user/categories/${cat}`);
          const data = res.data?.data || [];
          if (Array.isArray(data) && data.length > 0) found.push(cat);
        } catch {
          // category doesn't exist – skip
        }
      }
      if (found.length > 0) {
        setAvailableCategories(found);
        setActiveCategory(found[0]);
      }
    };
    probe();
  }, []);

  // Fetch products whenever active category changes
  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    const fetch = async () => {
      try {
        const res = await api.get(`/auth/api/user/categories/${activeCategory}`);
        const data = res.data?.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeCategory]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/user/login?redirect=/');
      return;
    }
    try {
      await api.post('/auth/api/user/cart', {
        productId: item.id,
        sku: item.sku,
        quantity: 1,
      });
      showToast(`✅ "${item.productName}" added to cart!`);
    } catch {
      showToast('❌ Failed to add to cart. Try again.');
    }
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  if (availableCategories.length === 0 && !loading) return null;

  return (
    <>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-white border border-[#3BB77E] outline outline-4 outline-[#def9ec] text-[#253d4e] px-8 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3">
          {toastMsg}
        </div>
      )}

      <section style={{ padding: '48px 0 32px', background: '#f8fdf9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#253d4e', margin: 0 }}>
              Shop by Category
            </h2>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: '999px',
                    border: '2px solid',
                    borderColor: activeCategory === cat ? '#3BB77E' : '#e2e8f0',
                    background: activeCategory === cat ? '#3BB77E' : '#fff',
                    color: activeCategory === cat ? '#fff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.03em',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scroll Arrows */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => scroll(-1)}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3BB77E'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3BB77E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => scroll(1)}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3BB77E'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3BB77E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* Scrollable Product Strip */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3BB77E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontWeight: 600 }}>
              No products found in this category.
            </div>
          ) : (
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '8px',
              }}
            >
              {products.map((item) => {
                const mrp = parseFloat(item.mrp || 0);
                const totalPrice = parseFloat(item.totalPrice || 0);
                const discount = parseFloat(item.discount || 0);
                const hasDiscount = discount > 0;

                return (
                  <div
                    key={item.id + item.sku}
                    style={{
                      minWidth: 200,
                      maxWidth: 200,
                      background: '#fff',
                      border: '1.5px solid #e8f5ee',
                      borderRadius: 16,
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      position: 'relative',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      cursor: 'default',
                      boxShadow: '0 2px 8px rgba(59,183,126,0.06)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,183,126,0.15)'; e.currentTarget.style.borderColor = '#3BB77E'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,183,126,0.06)'; e.currentTarget.style.borderColor = '#e8f5ee'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Discount badge */}
                    {hasDiscount && (
                      <div style={{ position: 'absolute', top: 0, left: 0, background: '#3BB77E', color: '#fff', padding: '4px 12px', borderRadius: '16px 0 16px 0', fontSize: 11, fontWeight: 700 }}>
                        {discount.toFixed(0)}% OFF
                      </div>
                    )}

                    {/* Product Image */}
                    <div style={{ width: '100%', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 12, background: '#f8fdf9' }}>
                      <AuthImage
                        dbPath={item.imageUrl}
                        alt={item.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.unit}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#253d4e', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.productName}
                      </h4>

                      {/* Price row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#3BB77E' }}>₹{totalPrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>₹{mrp.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Stock */}
                      <span style={{ fontSize: 11, color: item.stock > 0 ? '#64748b' : '#f74b81', fontWeight: 600 }}>
                        {item.stock > 0 ? `In Stock: ${item.stock}` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Add to cart */}
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      disabled={item.stock <= 0}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '8px 0', borderRadius: 8,
                        border: 'none', cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                        background: item.stock > 0 ? '#def9ec' : '#f0f0f0',
                        color: item.stock > 0 ? '#3BB77E' : '#aaa',
                        fontWeight: 700, fontSize: 12,
                        transition: 'all 0.2s',
                        opacity: item.stock > 0 ? 1 : 0.6,
                      }}
                      onMouseEnter={e => { if (item.stock > 0) { e.currentTarget.style.background = '#3BB77E'; e.currentTarget.style.color = '#fff'; } }}
                      onMouseLeave={e => { if (item.stock > 0) { e.currentTarget.style.background = '#def9ec'; e.currentTarget.style.color = '#3BB77E'; } }}
                    >
                      <CartIcon /> Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        div[ref]::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default CategoryProductsStrip;
