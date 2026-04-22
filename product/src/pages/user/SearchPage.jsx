import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import AuthImage from '../../components/AuthImage';
import SiteLayout from '../../homepage/SiteLayout';
import OrderModal from '../../components/OrderModal';

/* ── icons ─────────────────────────────────────────────────────────── */
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

/* ── component ──────────────────────────────────────────────────────── */
const SearchPage = () => {
  const [searchParams]   = useSearchParams();
  const query            = searchParams.get('q') || '';
  const navigate         = useNavigate();
  const isAuthenticated  = useSelector((state) => state.auth?.status);

  /* product list */
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* modal */
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [modalProduct,  setModalProduct]  = useState(null);
  const [modalLoading,  setModalLoading]  = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalQty,      setModalQty]      = useState(1);
  const [qtyError,      setQtyError]      = useState('');

  /* ui feedback */
  const [toastMsg,    setToastMsg]    = useState('');
  const [loginPrompt, setLoginPrompt] = useState(false);

  /* order modal */
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  /* ── fetch search results ─────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    // Use the search API provided by user
    api.get(`/auth/api/user/products/search?q=${encodeURIComponent(query)}`)
      .then(res => {
        const data = res.data?.data || res.data?.products || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  /* ── toast helper ───────────────────────────────────────────────── */
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  /* ── open product detail modal ───────────────────────────────────── */
  const handleProductClick = async (identifier) => {
    if (!identifier) return;
    setIsModalOpen(true);
    setModalLoading(true);
    setModalProduct(null);
    setSelectedBatch(null);
    setModalQty(1);
    setQtyError('');
    try {
        let productDetails = null;
        try {
            // First try fetching with the provided identifier (might be SKU or ID)
            const response = await api.get(`/auth/api/user/product/${identifier}`);
            productDetails = response.data?.data || response.data;
        } catch (err) {
            // Fallback: fetch all products and map to SKU
            const allProductsRes = await api.get('/auth/api/user/products');
            let productData = allProductsRes.data?.data || allProductsRes.data?.products || allProductsRes.data || [];
            productData = Array.isArray(productData) ? productData : [];
            
            const matchedProduct = productData.find(p => p.id == identifier || p._id == identifier || p.productId == identifier);
            if (matchedProduct && matchedProduct.sku) {
                const response = await api.get(`/auth/api/user/products/sku/${matchedProduct.sku}`);
                productDetails = response.data?.data || response.data;
            } else {
                throw new Error("Product details not found or missing SKU mapping.");
            }
        }
        setModalProduct(productDetails);
        if (productDetails?.availableBatches?.length > 0) {
          setSelectedBatch(productDetails.availableBatches[0]);
        }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  /* ── batch price helper ─────────────────────────────────────────── */
  const getBatchFinalPrice = (batch) => {
    // Exactly matching backend logic: pricePerUnit = basePrice - discount
    const basePrice = parseFloat(batch.basePrice || batch.mrp || 0);
    const discount = parseFloat(batch.discount || 0);
    return (basePrice - discount).toFixed(2);
  };

  /* ── add to cart (from modal) ───────────────────────────────────── */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(false);
      setLoginPrompt(true);
      setTimeout(() => setLoginPrompt(false), 5000);
      return;
    }
    const qty = parseInt(modalQty) || 0;
    if (qty < 1) { setQtyError('⚠️ Minimum 1 quantity required.'); return; }
    setQtyError('');
    if (!selectedBatch) { showToast('⚠️ Please select a weight/unit.'); return; }

    try {
      await api.post('/auth/api/user/cart', {
        productId: modalProduct?.id || modalProduct?._id,
        sku:       selectedBatch.sku || modalProduct?.sku,
        batchId:   selectedBatch.batchId,
        quantity:  qty,
      });
      showToast(`✅ "${modalProduct?.productName}" ×${qty} added to cart!`);
      setIsModalOpen(false);
    } catch {
      showToast('❌ Failed to add to cart. Please try again.');
    }
  };

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <SiteLayout>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{
          position:'fixed', top:90, left:'50%', transform:'translateX(-50%)',
          zIndex:400, background:'#fff', border:'1.5px solid #3BB77E',
          outline:'4px solid #def9ec', color:'#253d4e', padding:'14px 28px',
          borderRadius:14, boxShadow:'0 8px 32px rgba(59,183,126,0.18)',
          fontWeight:700, fontSize:15, display:'flex', alignItems:'center', gap:10,
          animation:'slideDown 0.3s ease',
        }}>
          {toastMsg}
        </div>
      )}

      {/* ── Login Prompt Modal ── */}
      {loginPrompt && (
        <div style={{
          position:'fixed', inset:0, zIndex:500,
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }} onClick={() => setLoginPrompt(false)}>
          <div style={{
            background:'#fff', borderRadius:20, padding:'40px 32px',
            maxWidth:360, width:'100%', textAlign:'center',
            boxShadow:'0 24px 64px rgba(0,0,0,0.18)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:12,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>🔒</div>
            <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:'#253d4e' }}>Login Required</h3>
            <p style={{ margin:0, color:'#64748b', fontSize:14 }}>You need to be logged in to add products to your cart.</p>
            <button onClick={() => navigate('/user/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))}
              style={{ width:'100%', padding:'13px 0', border:'none', borderRadius:12, background:'#3BB77E', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:8 }}>
              Go to Login
            </button>
            <button onClick={() => setLoginPrompt(false)}
              style={{ background:'none', border:'none', color:'#94a3b8', fontWeight:600, cursor:'pointer', fontSize:13 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      {isModalOpen && (
        <div
          style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:860, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #f1f5f9' }}>
              <h3 style={{ margin:0, fontWeight:800, fontSize:18, color:'#253d4e' }}>Product Details</h3>
              <button onClick={() => setIsModalOpen(false)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:4, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}
                onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background='none'}
              ><CloseIcon /></button>
            </div>

            {/* Modal body */}
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>
              {modalLoading ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:240, gap:12 }}>
                  <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTop:'4px solid #3BB77E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <p style={{ color:'#94a3b8', fontWeight:600, margin:0 }}>Loading details...</p>
                </div>
              ) : modalProduct ? (
                <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>

                  {/* LEFT: image + brand */}
                  <div style={{ flex:'0 0 240px', display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ background:'#f8fdf9', borderRadius:16, border:'1.5px solid #e8f5ee', padding:16, display:'flex', alignItems:'center', justifyContent:'center', aspectRatio:'1' }}>
                      <AuthImage dbPath={modalProduct.imageUrl} alt={modalProduct.productName} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    </div>
                    {modalProduct.brand && (
                      <div style={{ background:'#f0fdf6', border:'1px solid #bbf7d0', borderRadius:10, padding:'8px 14px', fontWeight:700, color:'#16a34a', textAlign:'center', fontSize:13 }}>
                        Brand: {modalProduct.brand}
                      </div>
                    )}
                    {selectedBatch?.discount > 0 && (
                      <div style={{ background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:10, padding:'8px 14px', fontWeight:700, color:'#e11d48', textAlign:'center', fontSize:13 }}>
                        Save {selectedBatch.discount}%!
                      </div>
                    )}
                  </div>

                  {/* RIGHT: details + batches */}
                  <div style={{ flex:1, minWidth:240, display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#3BB77E', textTransform:'uppercase', letterSpacing:'0.06em' }}>{modalProduct.categoryName}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8', background:'#f1f5f9', padding:'3px 8px', borderRadius:6, fontFamily:'monospace' }}>SKU: {modalProduct.sku}</span>
                    </div>

                    <h2 style={{ margin:0, fontSize:24, fontWeight:900, color:'#253d4e', lineHeight:1.2 }}>{modalProduct.productName}</h2>
                    {modalProduct.productDescription && (
                      <p style={{ margin:0, fontSize:13, color:'#64748b', lineHeight:1.6 }}>{modalProduct.productDescription}</p>
                    )}

                    {/* Stock */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <span style={{
                        fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:999,
                        background: modalProduct.totalAvailableStock > 0 ? '#dcfce7' : '#fee2e2',
                        color:      modalProduct.totalAvailableStock > 0 ? '#16a34a' : '#e11d48',
                      }}>
                        {modalProduct.stockStatus} ({modalProduct.totalAvailableStock} left)
                      </span>
                      {modalProduct.taxDetails && (
                        <span style={{ fontSize:11, color:'#94a3b8', background:'#f1f5f9', padding:'4px 10px', borderRadius:999 }}>
                          Tax: {modalProduct.taxDetails.totalTax}
                        </span>
                      )}
                    </div>

                    {/* ── Batch selection ── */}
                    {modalProduct.availableBatches?.length > 0 && (
                      <div>
                        <h4 style={{ margin:'0 0 10px', fontWeight:800, fontSize:14, color:'#253d4e' }}>Select Weight/Unit</h4>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          {modalProduct.availableBatches.map(batch => {
                            const finalPrice  = getBatchFinalPrice(batch);
                            const isSelected  = selectedBatch?.batchId === batch.batchId;
                            const outOfStock  = parseInt(batch.stock || 0) <= 0;
                            return (
                              <div
                                key={batch.batchId}
                                onClick={() => !outOfStock && setSelectedBatch(batch)}
                                style={{
                                  position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between',
                                  padding:'12px 14px', borderRadius:12,
                                  border: isSelected && !outOfStock ? '2px solid #3BB77E' : '2px solid #e2e8f0',
                                  background: isSelected && !outOfStock ? '#f0fdf6' : outOfStock ? '#fafafa' : '#fff',
                                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                                  opacity: outOfStock ? 0.55 : 1,
                                  transition:'all 0.15s',
                                  boxShadow: isSelected && !outOfStock ? '0 4px 14px rgba(59,183,126,0.15)' : 'none',
                                }}
                              >
                                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <span style={{ fontWeight:700, color:'#253d4e', fontSize:13 }}>
                                      {batch.baseWeight && batch.baseUnit 
                                        ? `${batch.baseWeight}${batch.baseUnit}` 
                                        : (batch.weight && batch.unit && batch.unit !== batch.weight)
                                          ? `${batch.weight}${batch.unit}`
                                          : batch.unit}
                                    </span>
                                  </div>
                                  <span style={{ fontSize:11, color:'#94a3b8' }}>
                                    Exp: <strong style={{ color:'#475569' }}>{new Date(batch.expiryDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</strong>
                                    &nbsp;·&nbsp; Stock: <strong style={{ color:'#475569' }}>{batch.stock}</strong>
                                  </span>
                                  {outOfStock && <span style={{ fontSize:11, fontWeight:700, color:'#e11d48' }}>Out of Stock</span>}
                                </div>
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, marginLeft:12 }}>
                                  {batch.discount > 0 && (
                                    <span style={{ fontSize:11, textDecoration:'line-through', color:'#94a3b8' }}>₹{parseFloat(batch.mrp).toFixed(2)}</span>
                                  )}
                                  <span style={{ fontSize:18, fontWeight:900, color:'#3BB77E', lineHeight:1 }}>₹{finalPrice}</span>
                                  {batch.discount > 0 && (
                                    <span style={{ fontSize:10, background:'#fee2e2', color:'#e11d48', fontWeight:700, padding:'2px 7px', borderRadius:4 }}>{batch.discount}% OFF</span>
                                  )}
                                </div>
                                {isSelected && !outOfStock && (
                                  <div style={{ position:'absolute', top:8, right:8, width:20, height:20, background:'#3BB77E', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8', fontSize:15 }}>Could not load product details.</div>
              )}
            </div>

            {/* Modal footer: qty stepper + add to cart */}
            {!modalLoading && modalProduct && (
              <div style={{ borderTop:'1px solid #f1f5f9', padding:'16px 24px', background:'#fafeff' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  {/* Qty stepper */}
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quantity</span>
                    <div style={{ display:'flex', alignItems:'center' }}>
                      <button type="button"
                        onClick={() => { setModalQty(q => Math.max(1, (parseInt(q)||1) - 1)); setQtyError(''); }}
                        style={{ width:34, height:34, borderRadius:'8px 0 0 8px', border:'1.5px solid #d1fae5', borderRight:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:900, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                      >−</button>
                      <input
                        type="number" min="1"
                        value={modalQty}
                        onChange={e => { setModalQty(Math.max(1, parseInt(e.target.value)||1)); setQtyError(''); }}
                        style={{ width:52, height:34, border:'1.5px solid #d1fae5', textAlign:'center', fontWeight:700, fontSize:15, outline:'none', color:'#253d4e' }}
                      />
                      <button type="button"
                        onClick={() => { setModalQty(q => (parseInt(q)||1) + 1); setQtyError(''); }}
                        style={{ width:34, height:34, borderRadius:'0 8px 8px 0', border:'1.5px solid #d1fae5', borderLeft:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:900, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                      >+</button>
                    </div>
                    {qtyError && <span style={{ color:'#ef4444', fontSize:12, fontWeight:600 }}>{qtyError}</span>}
                  </div>

                  {/* Live total */}
                  {selectedBatch && (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:11, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Total</div>
                      <div style={{ fontSize:26, fontWeight:900, color:'#3BB77E', lineHeight:1 }}>
                        ₹{(parseFloat(getBatchFinalPrice(selectedBatch)) * (parseInt(modalQty)||1)).toFixed(2)}
                      </div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>₹{getBatchFinalPrice(selectedBatch)} × {parseInt(modalQty)||1}</div>
                    </div>
                  )}
                </div>

                {/* Batch info + action buttons */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, color:'#64748b' }}>
                    {selectedBatch
                      ? <span>Weight/Unit: <strong style={{ color:'#253d4e' }}>
                          {selectedBatch.baseWeight && selectedBatch.baseUnit 
                            ? `${selectedBatch.baseWeight}${selectedBatch.baseUnit}` 
                            : (selectedBatch.weight && selectedBatch.unit && selectedBatch.unit !== selectedBatch.weight)
                              ? `${selectedBatch.weight}${selectedBatch.unit}`
                              : selectedBatch.unit}
                        </strong></span>
                      : <span style={{ color:'#d97706', fontWeight:600 }}>⚠️ Please select a weight/unit</span>
                    }
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setIsModalOpen(false)}
                      style={{ padding:'10px 18px', borderRadius:10, border:'none', background:'#f1f5f9', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      Close
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedBatch}
                      style={{ padding:'10px 20px', borderRadius:10, border:'none', background: selectedBatch ? '#3BB77E' : '#e2e8f0', color: selectedBatch ? '#fff' : '#94a3b8', fontWeight:700, fontSize:13, cursor: selectedBatch ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:7, boxShadow: selectedBatch ? '0 4px 14px rgba(59,183,126,0.3)' : 'none', transition:'all 0.15s' }}>
                      <CartIcon /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { setIsModalOpen(false); setLoginPrompt(true); return; }
                        if (!selectedBatch) { showToast('⚠️ Please select a weight/unit first.'); return; }
                        setIsOrderModalOpen(true);
                      }}
                      disabled={!selectedBatch}
                      style={{ padding:'10px 18px', borderRadius:10, border:'none', background: selectedBatch ? '#f97316' : '#e2e8f0', color: selectedBatch ? '#fff' : '#94a3b8', fontWeight:700, fontSize:13, cursor: selectedBatch ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:7, boxShadow: selectedBatch ? '0 4px 14px rgba(249,115,22,0.3)' : 'none', transition:'all 0.15s' }}>
                      🛍️ Order Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ padding:'36px 0 20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f1f5f9', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', color:'#4a5568', fontWeight:600, fontSize:13, marginBottom:20, transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}
        ><BackIcon /> Back</button>

        <div style={{ display:'flex', alignItems:'baseline', gap:14 }}>
          <h1 style={{ margin:0, fontSize:'2rem', fontWeight:800, color:'#253d4e', textTransform:'capitalize' }}>Search Results</h1>
          {!loading && (
            <span style={{ background:'#def9ec', color:'#3BB77E', fontWeight:700, fontSize:13, padding:'3px 12px', borderRadius:999 }}>
              {products.length} {products.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
        <p style={{ margin:'6px 0 0', color:'#94a3b8', fontSize:14 }}>Showing products for: <strong style={{ color:'#253d4e' }}>"{query}"</strong></p>
        <div style={{ height:2, background:'linear-gradient(90deg,#3BB77E,transparent)', borderRadius:2, marginTop:16 }} />
      </div>

      {/* ── Product Grid ── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:300 }}>
          <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTop:'4px solid #3BB77E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0', color:'#94a3b8' }}>
          <div style={{ fontSize:64, marginBottom:16 }}><SearchIcon /></div>
          <h3 style={{ fontWeight:700, color:'#475569', margin:'0 0 8px' }}>No Results for "{query}"</h3>
          <p style={{ margin:0, fontSize:14 }}>Try searching for another product name or brand.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:22, paddingBottom:60 }}>
          {products.map((item) => {
            const mrp      = parseFloat(item.mrp || 0);
            const basePrice = parseFloat(item.basePrice || mrp);
            const discount = parseFloat(item.discount || 0);
            const displayPrice = basePrice - discount;
            
            // More robust "in stock" logic: check stock number, status string, or active flag
            const stockCount = parseInt(item.stock || item.totalAvailableStock || 0);
            const inStock    = stockCount > 0 || item.stockStatus === 'In Stock' || item.isActive !== false;

            return (
              <div
                key={item.id + item.sku}
                onClick={() => handleProductClick(item.id || item.productId || item._id || item.sku)}
                style={{ background:'#fff', border:'1.5px solid #e8f5ee', borderRadius:18, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative', boxShadow:'0 2px 10px rgba(59,183,126,0.07)', transition:'all 0.22s', cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(59,183,126,0.16)'; e.currentTarget.style.borderColor='#3BB77E'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(59,183,126,0.07)'; e.currentTarget.style.borderColor='#e8f5ee'; }}
              >
                {/* Image */}
                <div style={{ background:'#f8fdf9', height:170, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  <AuthImage dbPath={item.imageUrl} alt={item.productName} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                </div>

                {/* Info */}
                <div style={{ flex:1, padding:'14px 16px', display:'flex', flexDirection:'column', gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {item.baseWeight && item.baseUnit ? `${item.baseWeight}${item.baseUnit}` : item.unit}
                  </span>
                  <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:'#253d4e', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {item.productName}
                  </h4>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:17, fontWeight:800, color:'#3BB77E' }}>₹{displayPrice.toFixed(2)}</span>
                    {mrp > displayPrice && <span style={{ fontSize:12, color:'#94a3b8', textDecoration:'line-through' }}>₹{mrp.toFixed(2)}</span>}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2 }}>
                    {item.expiryDate && (
                      <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>
                        Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                      </span>
                    )}
                    <span style={{ fontSize:11, fontWeight:700, color: inStock ? '#3BB77E' : '#ef4444' }}>
                      {inStock ? (stockCount > 0 ? `In Stock: ${stockCount}` : 'In Stock') : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Click hint */}
                <div style={{ padding:'0 16px 14px' }}>
                  <div style={{ textAlign:'center', fontSize:11, color:'#94a3b8', fontWeight:600, letterSpacing:'0.04em' }}>
                    👆 Click to view details
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-12px); } to { opacity:1; transform:translate(-50%,0); } }
      `}</style>

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={modalProduct}
        selectedBatch={selectedBatch}
        quantity={modalQty}
        onSuccess={(msg) => {
          setIsModalOpen(false);
          showToast(msg);
        }}
      />
    </SiteLayout>
  );
};

export default SearchPage;
