import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthImage from '../components/AuthImage';
import OrderModal from '../components/OrderModal';

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth Integration
  const isAuthenticated = useSelector((state) => state.auth?.status);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Selected batch inside modal
  const [selectedBatch, setSelectedBatch] = useState(null);
  // Quantity in modal (default 1)
  const [modalQty, setModalQty] = useState(1);
  const [qtyError,  setQtyError]  = useState('');

  // Login Prompt State
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Toast State for Cart
  const [toastMsg, setToastMsg] = useState('');

  // Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/auth/api/user/products');
        let productData = response.data?.data || response.data?.products || response.data || [];
        productData = Array.isArray(productData) ? productData : [];

        // Show at most 7 unique products, no duplicates
        const finalProducts = productData.slice(0, 7);

        setProducts(finalProducts);
      } catch (error) {
        console.error('Error fetching popular products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = async (sku) => {
    if (!sku) return;
    setIsModalOpen(true);
    setModalLoading(true);
    setModalProduct(null);
    setSelectedBatch(null);
    setModalQty(1);
    setQtyError('');
    try {
      const response = await api.get(`/auth/api/user/products/sku/${sku}`);
      const data = response.data?.data || response.data;
      setModalProduct(data);
      // Pre-select the first available batch
      if (data?.availableBatches?.length > 0) {
        setSelectedBatch(data.availableBatches[0]);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAddToCart = async (e, item, batchOverride) => {
    e?.stopPropagation();

    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
      setTimeout(() => {
        setIsLoginPromptOpen((prev) => {
          if (prev) return false;
          return prev;
        });
      }, 5000);
      return;
    }

    // Validate quantity
    const qty = parseInt(modalQty) || 0;
    if (qty < 1) {
      setQtyError('⚠️ Minimum 1 quantity required.');
      return;
    }
    setQtyError('');

    // Determine which batch to use
    const batch = batchOverride || selectedBatch;

    if (!batch) {
      showToast('⚠️ Please select a weight/unit before adding to cart.');
      return;
    }

    try {
      const payload = {
        productId: item?.id || item?._id,
        sku: batch.sku || item?.sku,
        batchId: batch.batchId,
        quantity: qty,
      };
      await api.post('/auth/api/user/cart', payload);
      showToast(`✅ "${item?.productName || item?.name}" ×${qty} added to cart!`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Cart error', error);
      showToast('❌ Failed to add product to cart. Please try again later.');
    }
  };

  // Helper to compute final price for a batch
  const getBatchFinalPrice = (batch) => {
    const mrp = parseFloat(batch.mrp || 0);
    const discount = parseFloat(batch.discount || 0);
    if (discount > 0) {
      return (mrp - (mrp * discount) / 100).toFixed(2);
    }
    return mrp.toFixed(2);
  };

  return (
    <>
      {/* Add To Cart Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-white border border-[#3BB77E] outline outline-4 outline-[#def9ec] text-[#253d4e] px-8 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-10 duration-300">
          {toastMsg}
        </div>
      )}

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
            <p className="text-gray-500 font-medium mb-3">You must be logged in to add products to your cart.</p>
            <button
              onClick={() => navigate('/user/login?redirect=/')}
              className="w-full py-3 rounded-xl bg-[#3BB77E] text-white font-bold tracking-wide shadow-lg shadow-green-200 hover:-translate-y-0.5 hover:bg-green-600 transition-all"
            >
              Go to Login Page
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

      <section className="products-section w-full">
        <div className="section-header">
          <h2>Popular Products</h2>

        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-[#3BB77E] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((item) => {
              const id = item.id || item._id;
              const name = item.productName || item.name || 'Product';
              const category = item.category || item.categoryName || 'GENERAL';
              const mrp = parseFloat(item.mrp || 0);
              const totalPrice = parseFloat(item.totalPrice || item.price || item.sellingPrice || item.displayPrice || 0);
              const mainPriceToDisplay = mrp > 0 ? mrp : totalPrice;
              const image = item.imageUrl || item.image || item.productImage;
              const inStock = parseInt(item.stock || item.displayStock || 0) > 0 || item.isActive !== false;
              const tag = item.discount ? `${parseFloat(item.discount).toFixed(2)}%` : (inStock ? 'Sale' : 'Out');
              const tagColor = '#3BB77E';

              return (
                <div
                  className="product-card flex flex-col h-full cursor-pointer hover:-translate-y-1 transition-transform"
                  key={id}
                  onClick={() => handleProductClick(item.sku)}
                >
                  {tag && parseFloat(item.discount) > 0 && <div className="badge" style={{ backgroundColor: tagColor }}>{tag}</div>}
                  <div className="img-placeholder" style={{ position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <AuthImage dbPath={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <span className="text-[#adadad] text-[11px] font-bold uppercase tracking-wide mb-1.5">{category}</span>
                    <h4 className="text-[#253d4e] font-bold text-[15px] leading-snug mb-2.5 hover:text-[#3BB77E] transition-colors duration-200 truncate">
                      {name}
                    </h4>

                    <div className="flex items-center gap-1.5 mb-2 z-10 relative">
                      <div className="text-[#ffb300] text-[13px] tracking-widest relative top-[1px]">★★★★☆</div>
                      <span className="text-[#adadad] text-[12px] font-medium relative top-[2px]">({item.ratingCount || 0})</span>
                    </div>

                    <div className="text-[#adadad] text-[12.5px] font-medium mb-5">
                      By <span className="text-[#3BB77E]">NestFood</span>
                    </div>

                    <div className="flex items-end justify-between mt-auto pt-1 relative z-10">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#3BB77E] font-bold text-[19px] leading-none">₹{mainPriceToDisplay.toFixed(2)}</span>
                        </div>
                        {inStock
                          ? <span className="text-[#adadad] text-[12px] font-semibold">In Stock: {parseInt(item.stock || 0)}</span>
                          : <span className="text-[#f74b81] text-[12px] font-semibold">Out of Stock</span>
                        }
                      </div>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-[4px] bg-[#def9ec] hover:bg-[#3BB77E] text-[#3BB77E] hover:text-white transition-colors border-none outline-none shrink-0"
                        aria-label="Add to cart"
                        onClick={(e) => handleAddToCart(e, item, null)}
                      >
                        <CartIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
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
                    {selectedBatch?.discount > 0 && (
                      <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-center border border-red-100">
                        Save {selectedBatch.discount}%!
                      </div>
                    )}
                  </div>

                  {/* Right Col - Details */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#3BB77E] font-semibold tracking-wider text-sm uppercase">{modalProduct.categoryName}</span>
                      <span className="text-gray-400 text-sm font-mono bg-gray-100 px-2 py-1 rounded">SKU: {modalProduct.sku}</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{modalProduct.productName}</h2>
                    <p className="text-gray-500 text-sm mb-4">{modalProduct.productDescription}</p>

                    {/* Stock Info */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${modalProduct.totalAvailableStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {modalProduct.stockStatus} ({modalProduct.totalAvailableStock} left)
                      </span>
                      {modalProduct.taxDetails && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          Tax: {modalProduct.taxDetails.totalTax}
                        </span>
                      )}
                    </div>

                    {/* ===== BATCH SELECTION ===== */}
                    {modalProduct.availableBatches && modalProduct.availableBatches.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-gray-800 font-bold mb-3 text-base">Select Weight/Unit</h4>
                        <div className="flex flex-col gap-3">
                          {modalProduct.availableBatches.map((batch) => {
                            const finalPrice = getBatchFinalPrice(batch);
                            const isSelected = selectedBatch?.batchId === batch.batchId;
                            const isOutOfStock = parseInt(batch.stock || 0) <= 0;
                            return (
                              <div
                                key={batch.batchId}
                                onClick={() => !isOutOfStock && setSelectedBatch(batch)}
                                className={`
                                  relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer
                                  ${isOutOfStock ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : ''}
                                  ${isSelected && !isOutOfStock ? 'border-[#3BB77E] bg-[#f0fdf6] shadow-md' : ''}
                                  ${!isSelected && !isOutOfStock ? 'border-gray-200 hover:border-[#3BB77E] hover:bg-[#f7fef9]' : ''}
                                `}
                              >
                                {/* Left: batch info */}
                                <div className="flex flex-col gap-1">
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <span style={{ fontWeight:700, color:'#253d4e', fontSize:13 }}>
                                      {batch.baseWeight && batch.baseUnit 
                                        ? `${batch.baseWeight}${batch.baseUnit}` 
                                        : (batch.weight && batch.unit && batch.unit !== batch.weight)
                                          ? `${batch.weight}${batch.unit}`
                                          : batch.unit}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Expires: <span className="font-semibold text-gray-700">{new Date(batch.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    &nbsp;·&nbsp; Stock: <span className="font-semibold text-gray-700">{batch.stock}</span>
                                  </div>
                                  {isOutOfStock && <span className="text-xs font-bold text-red-500">Out of Stock</span>}
                                </div>

                                {/* Right: pricing */}
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                  {batch.discount > 0 && (
                                    <span className="text-xs line-through text-gray-400">₹{parseFloat(batch.mrp).toFixed(2)}</span>
                                  )}
                                  <span className="text-[#3BB77E] font-extrabold text-lg leading-none">₹{finalPrice}</span>
                                  {batch.discount > 0 && (
                                    <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded">{batch.discount}% OFF</span>
                                  )}
                                </div>

                                {/* Selected checkmark */}
                                {isSelected && !isOutOfStock && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#3BB77E] rounded-full flex items-center justify-center">
                                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                      <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {modalProduct.batchDescription && (
                      <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                        {modalProduct.batchDescription}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">Could not load product details.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
              {/* Quantity + price row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center gap-0">
                    <button
                      type="button"
                      onClick={() => { setModalQty(q => Math.max(1, (parseInt(q)||1) - 1)); setQtyError(''); }}
                      style={{ width:34, height:34, borderRadius:'8px 0 0 8px', border:'1.5px solid #d1fae5', borderRight:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:800, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                    >−</button>
                    <input
                      type="number" min="1"
                      value={modalQty}
                      onChange={e => { setModalQty(Math.max(1, parseInt(e.target.value)||1)); setQtyError(''); }}
                      style={{ width:52, height:34, border:'1.5px solid #d1fae5', textAlign:'center', fontWeight:700, fontSize:15, outline:'none', color:'#253d4e' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setModalQty(q => (parseInt(q)||1) + 1); setQtyError(''); }}
                      style={{ width:34, height:34, borderRadius:'0 8px 8px 0', border:'1.5px solid #d1fae5', borderLeft:'none', background:'#f0fdf6', color:'#3BB77E', fontWeight:800, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                    >+</button>
                  </div>
                  {qtyError && <span style={{ color:'#ef4444', fontSize:12, fontWeight:600 }}>{qtyError}</span>}
                </div>

                {selectedBatch && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total</div>
                    <div className="text-2xl font-extrabold text-[#3BB77E] leading-none">
                      ₹{(parseFloat(getBatchFinalPrice(selectedBatch)) * (parseInt(modalQty)||1)).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">₹{getBatchFinalPrice(selectedBatch)} × {parseInt(modalQty)||1}</div>
                  </div>
                )}
              </div>

              {/* Batch summary + action buttons */}
              <div className="flex items-center justify-between">
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
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(e, modalProduct, selectedBatch)}
                    disabled={!selectedBatch}
                    className="px-5 py-2.5 rounded-lg bg-[#3BB77E] text-white font-bold tracking-wide shadow-lg shadow-green-200 hover:-translate-y-0.5 hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <CartIcon /> Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                      if (!selectedBatch) { showToast('⚠️ Please select a weight/unit first.'); return; }
                      setIsOrderModalOpen(true);
                    }}
                    disabled={!selectedBatch}
                    style={{ padding:'10px 18px', borderRadius:10, border:'none', background: selectedBatch ? '#f97316' : '#e2e8f0', color: selectedBatch ? '#fff' : '#94a3b8', fontWeight:700, fontSize:13, cursor: selectedBatch ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:7, boxShadow: selectedBatch ? '0 4px 14px rgba(249,115,22,0.3)' : 'none', transition:'all 0.15s' }}
                  >
                    🛍️ Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
};

export default PopularProducts;