import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import AuthImage from '../../components/AuthImage';
import SiteLayout from '../../homepage/SiteLayout';
import CheckoutModal from '../../components/CheckoutModal';
import '../../homepage/Products.css';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const UserCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Auth Integration
  const isAuthenticated = useSelector((state) => state.auth?.status);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated) {
        setIsLoginPromptOpen(true);
        const timer = setTimeout(() => {
            navigate('/user/login?redirect=/');
        }, 4000);
        return () => clearTimeout(timer);
    }

    const fetchCart = async () => {
      try {
        const response = await api.get('/auth/api/user/cart');
        let items = response.data?.data?.items || response.data?.data || response.data?.items || response.data || [];
        setCartItems(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  // Update quantity via PUT API
  const handleQtyUpdate = async (cartItem, newQty) => {
    if (newQty < 1) return;
    const productData = cartItem.product || cartItem;
    const sku = productData.sku;
    const batchId = cartItem.batchId || productData.batchId;
    try {
      await api.put('/auth/api/user/cart', { sku, batchId, quantity: newQty });
      // Update locally
      setCartItems(prev => prev.map(ci => {
        const pd = ci.product || ci;
        if ((pd.sku === sku) && (ci.batchId === batchId || !batchId)) {
          return { ...ci, quantity: newQty };
        }
        return ci;
      }));
    } catch (err) {
      console.error('Failed to update qty', err);
    }
  };

  // Remove item via DELETE API
  const handleRemoveItem = async (e, cartItem, idx) => {
    e.stopPropagation();

    // Log the full item so we can see the actual ID field in DevTools
    console.log('[Cart] cartItem structure:', JSON.stringify(cartItem, null, 2));

    // Try every possible field name the backend might use
    const itemId =
      cartItem.id            ||
      cartItem.cartItemId    ||
      cartItem.cart_item_id  ||
      cartItem.itemId        ||
      cartItem._id           ||
      cartItem.CartItem?.id  ||
      cartItem.cartId        ||
      (cartItem.product && (cartItem.product.cartItemId || cartItem.product.cart_item_id));

    if (!itemId) {
      console.error('[Cart] Could not find itemId in:', cartItem);
      showToast('❌ Cannot remove item: ID not found. Check console for details.');
      return;
    }

    try {
      await api.delete(`/auth/api/user/cart/${itemId}`);
      setCartItems(prev => prev.filter((_, i) => i !== idx));
      showToast('🗑️ Item removed from cart.');
    } catch (err) {
      console.error('Failed to remove item', err);
      showToast('❌ Failed to remove item. Please try again.');
    }
  };

  const handleProductClick = async (identifier) => {
    if (!identifier) return;
    setIsModalOpen(true);
    setModalLoading(true);
    setModalProduct(null);
    try {
        let productDetails = null;
        try {
            // First try fetching with the provided identifier (might be SKU or ID)
            const response = await api.get(`/auth/api/user/product/${identifier}`);
            productDetails = response.data?.data || response.data;
        } catch (err) {
            // If fetching by identifier fails (e.g. it was a numeric ID but backend requires SKU),
            // fetch all products and try to map it to a SKU
            const allProductsRes = await api.get('/auth/api/user/products');
            let productData = allProductsRes.data?.data || allProductsRes.data?.products || allProductsRes.data || [];
            productData = Array.isArray(productData) ? productData : [];
            
            const matchedProduct = productData.find(p => p.id == identifier || p._id == identifier || p.productId == identifier);
            if (matchedProduct && matchedProduct.sku) {
                const response = await api.get(`/auth/api/user/product/${matchedProduct.sku}`);
                productDetails = response.data?.data || response.data;
            } else {
                throw new Error("Product details not found or missing SKU mapping.");
            }
        }
        setModalProduct(productDetails);
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <SiteLayout>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position:'fixed', top:90, left:'50%', transform:'translateX(-50%)',
          zIndex:200, background:'#fff', border:'1.5px solid #3BB77E',
          outline:'4px solid #def9ec', color:'#253d4e', padding:'14px 28px',
          borderRadius:14, boxShadow:'0 8px 32px rgba(59,183,126,0.18)',
          fontWeight:700, fontSize:15, display:'flex', alignItems:'center', gap:10,
        }}>
          {toastMsg}
        </div>
      )}
      <div className="cart-page-wrapper w-full max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-[#253d4e]">Your Cart</h1>
            <button 
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl bg-white border-2 border-[#3BB77E] text-[#3BB77E] hover:bg-[#3BB77E] hover:text-white font-bold tracking-wide shadow-sm transition-colors duration-200 flex items-center gap-2"
            >
                &larr; Go back to Home page
            </button>
        </div>

      {/* Login Requirement Modal Overlay */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </div>
             <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
             <p className="text-gray-500 font-medium mb-3">Please log in to view your cart details and continue shopping. You will be redirected shortly...</p>
             <button 
                 onClick={() => {
                     setIsLoginPromptOpen(false);
                     navigate('/user/login?redirect=/');
                 }}
                 className="w-full py-3 rounded-xl bg-[#3BB77E] text-white font-bold tracking-wide shadow-lg shadow-green-200 hover:-translate-y-0.5 hover:bg-green-600 transition-all"
             >
                 Go to Login Page Now
             </button>
             <button 
                 onClick={() => setIsLoginPromptOpen(false)}
                 className="mt-2 text-gray-400 hover:text-gray-600 font-semibold transition-colors"
             >
                 Dismiss
             </button>
          </div>
        </div>
      )}

        {loading ? (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-[#f3f3f3] border-t-[#3BB77E] rounded-full animate-spin"></div>
            </div>
        ) : cartItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-24 h-24 bg-gray-200 text-gray-400 rounded-full flex flex-col items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Your cart is conceptually empty.</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Head back to the shop to explore our exciting products!</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3.5 rounded-xl bg-[#3BB77E] text-white font-bold tracking-wide shadow-lg shadow-green-200 hover:-translate-y-0.5 hover:bg-green-600 transition-all inline-block"
                >
                    Start Shopping
                </button>
            </div>
        ) : (
            <div className="product-grid">
                {cartItems.map((cartItem, idx) => {
                    // Normalize the item since cart responses often nest product data.
                    const productData = cartItem.product || cartItem;
                    const id = productData.productId || productData.id || productData._id || `cart-idx-${idx}`;
                    const name = productData.productName || productData.name || "Product";
                    const category = productData.category || productData.categoryName || "GENERAL";
                    const image = productData.imageUrl || productData.image || productData.productImage;
                    const mrp = parseFloat(productData.mrp || 0);
                    const basePrice = parseFloat(productData.basePrice || mrp);
                    const discount = parseFloat(productData.discount || 0);
                    const mainPriceToDisplay = basePrice - discount;
                    const qty = cartItem.quantity || 1;

                    return (
                        <div 
                            className="product-card flex flex-col h-full cursor-pointer hover:-translate-y-1 transition-transform relative" 
                            key={`${id}-${idx}`} 
                            onClick={() => handleProductClick(productData.sku || productData.productId || productData.id)}
                        >
                            {/* ❌ Remove button — top right */}
                            <button
                              onClick={e => handleRemoveItem(e, cartItem, idx)}
                              title="Remove from cart"
                              style={{
                                position:'absolute', top:8, right:8, zIndex:10,
                                width:28, height:28, borderRadius:'50%',
                                background:'#fff1f2', border:'1.5px solid #fecdd3',
                                color:'#e11d48', display:'flex', alignItems:'center',
                                justifyContent:'center', cursor:'pointer', padding:0,
                                boxShadow:'0 2px 6px rgba(225,29,72,0.15)',
                                transition:'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background='#e11d48'; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.color='#e11d48'; }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                            {/* Qty stepper (replaces static badge) */}
                            <div style={{
                              position:'absolute', top:10, left:10, zIndex:10,
                              display:'flex', alignItems:'center', gap:0,
                              background:'rgba(255,255,255,0.95)', borderRadius:8,
                              border:'1.5px solid #d1fae5', overflow:'hidden',
                              boxShadow:'0 2px 8px rgba(59,183,126,0.12)',
                            }}>
                              <button
                                onClick={e => { e.stopPropagation(); handleQtyUpdate(cartItem, (cartItem.quantity||1)-1); }}
                                style={{ width:26, height:26, border:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:900, fontSize:15, cursor:(cartItem.quantity||1)<=1?'not-allowed':'pointer', opacity:(cartItem.quantity||1)<=1?0.4:1, display:'flex', alignItems:'center', justifyContent:'center' }}
                              >−</button>
                              <span style={{ minWidth:22, textAlign:'center', fontWeight:800, fontSize:12, color:'#253d4e', padding:'0 2px' }}>{cartItem.quantity||1}</span>
                              <button
                                onClick={e => { e.stopPropagation(); handleQtyUpdate(cartItem, (cartItem.quantity||1)+1); }}
                                style={{ width:26, height:26, border:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:900, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                              >+</button>
                            </div>
                            <div className="img-placeholder" style={{ position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '16px' }}>
                                <AuthImage dbPath={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            
                            <div className="flex flex-col flex-1 p-4">
                                <span className="text-[#adadad] text-[11px] font-bold uppercase tracking-wide mb-1.5">{category}</span>
                                <h4 className="text-[#253d4e] font-bold text-[15px] leading-snug mb-2.5 hover:text-[#3BB77E] transition-colors duration-200 truncate">
                                    {name}
                                </h4>
                                
                                <div className="text-[#adadad] text-[12.5px] font-medium mb-4">
                                    By <span className="text-[#3BB77E]">NestFood</span>
                                </div>
                                
                                <div className="flex items-end justify-between mt-auto pt-1 border-t border-gray-100 pt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total</span>
                                        <span className="text-[#3BB77E] font-bold text-[19px] leading-none">
                                            ₹{(mainPriceToDisplay * qty).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-xs text-right">
                                        ₹{mainPriceToDisplay.toFixed(2)} / each
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* ── Order Summary Bar ── */}
        {!loading && cartItems.length > 0 && (() => {
          const totalItems = cartItems.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
          const grandTotal = cartItems.reduce((sum, ci) => {
            const p = ci.product || ci;
            const mrp = parseFloat(p.mrp || 0);
            const basePrice = parseFloat(p.basePrice || mrp);
            const discount = parseFloat(p.discount || 0);
            const unit = basePrice - discount;
            return sum + unit * (ci.quantity || 1);
          }, 0);
          return (
            <div style={{
              marginTop: 32,
              borderTop: '2px dashed #d1fae5',
              paddingTop: 24,
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf6 0%, #dcfce7 100%)',
                border: '1.5px solid #86efac',
                borderRadius: 16,
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: '0 4px 16px rgba(59,183,126,0.1)',
              }}>
                {/* Left: item count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, background: '#3BB77E', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontWeight: 800, fontSize: 16,
                  }}>{totalItems}</div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items in cart</div>
                    <div style={{ fontSize: 13, color: '#253d4e', fontWeight: 700 }}>{cartItems.length} {cartItems.length === 1 ? 'product' : 'different products'}</div>
                  </div>
                </div>

                {/* Middle: breakdown */}
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {cartItems.map((ci, idx) => {
                    const p = ci.product || ci;
                    const mrp = parseFloat(p.mrp || 0);
                    const basePrice = parseFloat(p.basePrice || mrp);
                    const discount = parseFloat(p.discount || 0);
                    const unit = basePrice - discount;
                    const qty = ci.quantity || 1;
                    const name = p.productName || p.name || 'Product';
                    return (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#253d4e' }}>₹{unit.toFixed(0)} × {qty}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#3BB77E' }}>= ₹{(unit * qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: grand total + Order button */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Grand Total</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#3BB77E', lineHeight: 1 }}>₹{grandTotal.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Incl. all taxes</div>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    style={{
                      padding: '12px 28px', border: 'none', borderRadius: 12,
                      background: '#f97316', color: '#fff',
                      fontWeight: 800, fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ea6f0a'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
                  >
                    🛍️ Order from Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

       {/* Product Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-[#f3f3f3] border-t-[#3BB77E] rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading details...</p>
                </div>
              ) : modalProduct ? (
                <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Left Col - Image & Brand */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-center">
                      <AuthImage 
                        dbPath={modalProduct.imageUrl} 
                        alt={modalProduct.productName} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    </div>
                    {modalProduct.brand && (
                      <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold text-center border border-green-100">
                        Brand: {modalProduct.brand}
                      </div>
                    )}
                    {modalProduct.pricing?.savingsPercentage && (
                         <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-center border border-red-100">
                         Save {modalProduct.pricing.savingsPercentage}!
                       </div>
                    )}
                  </div>

                  {/* Right Col - Details */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[#3BB77E] font-semibold tracking-wider text-sm uppercase">{modalProduct.categoryName}</span>
                        <span className="text-gray-400 text-sm font-mono bg-gray-100 px-2 py-1 rounded">SKU: {modalProduct.sku}</span>
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{modalProduct.productName}</h2>
                    
                    {/* Pricing Block */}
                    {modalProduct.pricing && (
                        <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-4xl font-bold text-[#3BB77E]">₹{parseFloat(modalProduct.pricing.mrp > 0 ? modalProduct.pricing.mrp : modalProduct.pricing.finalPrice).toFixed(2)}</span>
                          </div>
                        </div>
                    )}

                    <div className="prose prose-sm text-gray-600 mb-6">
                      <h4 className="text-gray-800 font-bold mb-2">Description</h4>
                      <p>{modalProduct.description || "No description available for this product."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">Stock Status</span>
                            <span className={`font-semibold ${modalProduct.totalAvailableStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {modalProduct.stockStatus || 'Unknown'} ({modalProduct.totalAvailableStock || 0} left)
                            </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">Unit Info</span>
                            <span className="font-semibold text-gray-800">
                                {modalProduct.unit} {modalProduct.weightInfo?.weight ? `(${modalProduct.weightInfo.weight} ${modalProduct.weightInfo.unit})` : ''}
                            </span>
                        </div>
                        {modalProduct.taxDetails && (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 col-span-2 flex justify-between">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Taxes Built-In (Total: {modalProduct.taxDetails.totalTax})</span>
                                <span className="font-semibold text-gray-700 text-sm">
                                    CGST: {modalProduct.taxDetails.cgst} | SGST: {modalProduct.taxDetails.sgst}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Batches Table (if needed) */}
                    {modalProduct.availableBatches && modalProduct.availableBatches.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-gray-800 font-bold mb-3">Available Batches</h4>
                            <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">Batch No</th>
                                            <th className="px-4 py-2">Expiry Date</th>
                                            <th className="px-4 py-2">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {modalProduct.availableBatches.map(b => (
                                            <tr key={b.batchId} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2 font-mono text-gray-700">{b.batchNo}</td>
                                                <td className="px-4 py-2 text-gray-600">{new Date(b.expiryDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{b.stock}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Could not load product details.
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50/50">
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="px-5 py-2.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-900 transition-colors"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartSummary={(() => {
          if (loading || cartItems.length === 0) return null;
          const totalItems = cartItems.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
          const grandTotal = cartItems.reduce((sum, ci) => {
            const p = ci.product || ci;
            const mrp   = parseFloat(p.mrp || 0);
            const basePrice = parseFloat(p.basePrice || mrp);
            const discount = parseFloat(p.discount || 0);
            const unitPrice = basePrice - discount;
            return sum + (unitPrice) * (ci.quantity || 1);
          }, 0);
          return { totalItems, grandTotal };
        })()}
        onSuccess={(msg) => {
          showToast(msg);
        }}
      />
    </SiteLayout>
  );
};

export default UserCart;
