import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SiteLayout from '../../homepage/SiteLayout';

/* ── Status colour map ────────────────────────────────────────────── */
const STATUS = {
  pending:    { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: 'Pending' },
  confirmed:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Confirmed' },
  assigned:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Assigned' },
  accepted:   { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Accepted' },
  packed:     { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff', label: 'Packed' },
  shipped:    { bg: '#eff6ff', color: '#0284c7', border: '#bae6fd', label: 'Shipped' },
  delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Delivered' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed' },
  returned:   { bg: '#fef2f2', color: '#dc2626', border: '#fecdd3', label: 'Returned' },
  cancelled:  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Cancelled' },
};


const getStatus = (s = '') => STATUS[s.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: s || 'Unknown' };

/* ── Icons ────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════════ */
const UserOrders = () => {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [cancelling, setCancelling] = useState({});
  const [trackModal, setTrackModal]   = useState({ open: false, orderId: null });
  const [trackData,  setTrackData]    = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);

  // Return Order States
  const [returnModal, setReturnModal] = useState({ open: false, orderId: null });
  const [returnData, setReturnData] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: '', items: [] });

  const fetchOrders = (showLoading = true) => {
    if (showLoading) setLoading(true);
    api.get('/auth/api/user/orders')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  // Auto-refresh every 5 seconds so status changes from employee appear instantly
  useEffect(() => {
    fetchOrders(true); // initial load with spinner

    const poller = setInterval(() => {
      fetchOrders(false); // silent background refresh — no spinner
    }, 3000);

    return () => clearInterval(poller); // cleanup on unmount
  }, []);


  const handleCancelOrder = async (orderRef) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(prev => ({ ...prev, [orderRef]: true }));
    try {
      // The user specified /auth/api/user/orders/:orderNumber/cancel
      await api.put(`/auth/api/user/orders/${orderRef}/cancel`, { status: 'cancelled' });
      alert("Order cancelled successfully");
      fetchOrders(false);
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback to singular 'order' route if plural 404s
        try {
          await api.put(`/auth/api/user/order/${orderRef}/cancel`, { status: 'cancelled' });
          alert("Order cancelled successfully");
          fetchOrders(false);
        } catch (fallbackErr) {
          console.error('Cancel fallback error:', fallbackErr);
          const msg = fallbackErr?.response?.data?.message || fallbackErr?.response?.data?.error || "Failed to cancel order";
          alert(`Failed: ${msg}`);
        }
      } else {
        console.error('Cancel error:', err);
        const msg = err?.response?.data?.message || err?.response?.data?.error || "Failed to cancel order";
        alert(`Failed: ${msg}`);
      }
    } finally {
      setCancelling(prev => ({ ...prev, [orderRef]: false }));
    }
  };

  const handleTrackOrder = async (orderRef) => {
    setTrackModal({ open: true, orderId: orderRef });
    setTrackLoading(true);
    setTrackData(null);
    try {
      const res = await api.get(`/auth/api/user/orders/track/${orderRef}`);
      setTrackData(res.data?.data || res.data);
    } catch (err) {
      console.error('Track error:', err);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleOpenReturnModal = async (orderRef) => {
    setReturnModal({ open: true, orderId: orderRef });
    setReturnLoading(true);
    setReturnData(null);
    setReturnForm({ reason: '', items: [] });
    try {
      const res = await api.get(`/auth/api/user/orders/${orderRef}/return-details`);
      const details = res.data?.data || res.data;
      setReturnData(details);
      
      // If single item, auto-select it
      if (details?.items?.length === 1) {
        const item = details.items[0];
        setReturnForm(prev => ({
          ...prev,
          items: [{ 
            batchId: item.batchId, 
            quantity: item.boughtQuantity || item.quantity || 1 
          }]
        }));
      }
    } catch (err) {
      console.error('Return details error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to load return details. Please try again.";
      alert(msg);
      setReturnModal({ open: false, orderId: null });
    } finally {
      setReturnLoading(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnForm.reason.trim()) return alert("Please provide a reason for return.");
    if (returnForm.items.length === 0) return alert("Please select at least one item to return.");

    setReturnSubmitting(true);
    try {
      await api.post('/auth/api/user/orders/return', {
        orderNumber: returnModal.orderId,
        reason: returnForm.reason,
        items: returnForm.items
      });
      alert("Return request submitted successfully!");
      setReturnModal({ open: false, orderId: null });
      fetchOrders(false);
    } catch (err) {
      console.error('Return submission error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to submit return request";
      alert(`Error: ${msg}`);
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleUpdateItemQuantity = (batchId, delta, maxQty) => {
    setReturnForm(prev => {
      const newItems = prev.items.map(item => {
        if (item.batchId === batchId) {
          const newQty = Math.max(1, Math.min(maxQty, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <SiteLayout>
      <div style={{ padding: '36px 0 64px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', color: '#4a5568',
              fontWeight: 600, fontSize: 13, marginBottom: 20, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <BackIcon /> Back to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, background: 'linear-gradient(135deg,#3BB77E,#1e9f62)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 16px rgba(59,183,126,0.3)',
            }}>
              <PackageIcon />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, color: '#253d4e' }}>My Orders</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginTop: 2 }}>Track and view all your past orders</p>
            </div>
            {!loading && orders.length > 0 && (
              <span style={{
                marginLeft: 8, background: '#def9ec', color: '#3BB77E',
                fontWeight: 700, fontSize: 13, padding: '4px 14px', borderRadius: 999,
              }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ height: 3, background: 'linear-gradient(90deg,#3BB77E,transparent)', borderRadius: 2, marginTop: 18 }} />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTop: '4px solid #3BB77E', borderRadius: '50%', animation: 'ordSpin 0.8s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>Loading your orders…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>😕</div>
            <h3 style={{ fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>{error}</h3>
            <button onClick={() => window.location.reload()}
              style={{ marginTop: 12, padding: '10px 24px', border: 'none', borderRadius: 10, background: '#3BB77E', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#f8fdf9', borderRadius: 20, border: '1.5px dashed #bbf7d0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontWeight: 800, color: '#253d4e', margin: '0 0 8px', fontSize: 20 }}>No orders yet</h3>
            <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: 14 }}>You haven't placed any orders. Start shopping!</p>
            <button onClick={() => navigate('/')}
              style={{ padding: '12px 32px', border: 'none', borderRadius: 12, background: '#3BB77E', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,183,126,0.3)' }}>
              🛒 Shop Now
            </button>
          </div>
        )}

        {/* ── Orders list ── */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {orders.map((order) => {
              const st = getStatus(order.status);
              return (
                <div
                  key={order.orderId}
                  style={{
                    background: '#fff', border: '1.5px solid #e8f5ee',
                    borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 2px 16px rgba(59,183,126,0.07)',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,183,126,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(59,183,126,0.07)'}
                >
                  {/* ── Order header bar ── */}
                  <div style={{
                    background: 'linear-gradient(135deg,#f8fdf9 0%,#f0fdf6 100%)',
                    borderBottom: '1px solid #e8f5ee',
                    padding: '16px 24px',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                  }}>
                    {/* Left: order ID + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Number</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#253d4e' }}>#{order.orderNumber || order.orderId}</div>
                      </div>
                      <div style={{ width: 1, height: 36, background: '#e2e8f0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                        <CalendarIcon />
                        {fmtDate(order.createdAt)}
                      </div>
                    </div>

                    {/* Right: status + payment */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        background: st.bg, color: st.color, border: `1.5px solid ${st.border}`,
                        padding: '5px 14px', borderRadius: 999,
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
                      }}>
                        ● {st.label}
                      </span>
                      <span style={{
                        background: '#f1f5f9', color: '#475569',
                        border: '1.5px solid #e2e8f0',
                        padding: '5px 12px', borderRadius: 999,
                        fontSize: 12, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <CodIcon /> {order.paymentType || 'COD'}
                      </span>
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>

                      {/* Items list */}
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          Items Ordered
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                background: '#f8fdf9', borderRadius: 12,
                                border: '1px solid #e8f5ee', padding: '10px 14px',
                              }}
                            >
                              {/* Product image or placeholder */}
                              <div style={{
                                width: 52, height: 52, borderRadius: 10,
                                background: '#e8f5ee', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, overflow: 'hidden',
                              }}>
                                {item.imageUrl
                                  ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                  : '🛒'
                                }
                              </div>

                              {/* Product info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: '#253d4e', fontSize: 14, marginBottom: 2,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.productName || 'Product'}
                                </div>
                                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                  ₹{parseFloat(item.pricePerUnit || 0).toFixed(2)} × {item.quantity}
                                </div>
                              </div>

                              {/* Item total */}
                              <div style={{ fontWeight: 800, color: '#3BB77E', fontSize: 15, flexShrink: 0 }}>
                                ₹{parseFloat(item.totalItemPrice || 0).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order summary */}
                      <div style={{ width: 240, flexShrink: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          Summary
                        </div>

                        {/* Delivery address */}
                        {order.deliveryAddress && (
                          <div style={{ background: '#f8fdf9', border: '1px solid #e8f5ee', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                              <span style={{ color: '#3BB77E', marginTop: 1 }}><LocationIcon /></span>
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Delivery To</div>
                                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>{order.deliveryAddress}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price breakdown */}
                        <div style={{ background: '#f8fdf9', border: '1px solid #e8f5ee', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Subtotal</span>
                            <span style={{ fontSize: 13, color: '#253d4e', fontWeight: 700 }}>₹{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Tax</span>
                            <span style={{ fontSize: 13, color: '#253d4e', fontWeight: 700 }}>₹{parseFloat(order.totalTax || 0).toFixed(2)}</span>
                          </div>
                          <div style={{ height: 1, background: '#e2e8f0', margin: '2px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#253d4e', fontWeight: 800 }}>Total</span>
                            <span style={{ fontSize: 18, color: '#3BB77E', fontWeight: 900 }}>₹{parseFloat(order.finalAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Cancel Button — hidden once order is packed, shipped, delivered, or cancelled/returned */}
                        {order.status && !['packed', 'shipped', 'delivered', 'completed', 'cancelled', 'success', 'returned'].includes(order.status.toLowerCase()) && (
                          <button
                            onClick={() => handleCancelOrder(order.orderNumber || order.orderId || order.id)}
                            disabled={cancelling[order.orderNumber || order.orderId || order.id]}
                            style={{
                              marginTop: 12, width: '100%', padding: '10px',
                              background: cancelling[order.orderNumber || order.orderId || order.id] ? '#fecdd3' : '#fff1f2',
                              color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8,
                              fontWeight: 700, fontSize: 13, 
                              cursor: cancelling[order.orderNumber || order.orderId || order.id] ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}
                            onMouseEnter={e => { if(!cancelling[order.orderNumber || order.orderId || order.id]) e.currentTarget.style.background = '#ffe4e6'; }}
                            onMouseLeave={e => { if(!cancelling[order.orderNumber || order.orderId || order.id]) e.currentTarget.style.background = '#fff1f2'; }}
                          >
                            {cancelling[order.orderNumber || order.orderId || order.id] ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}

                        {/* Return Order Button — visible only when order is shipped, delivered, or completed AND not already returned */}
                        {order.status && ['shipped', 'delivered', 'completed', 'success'].includes(order.status.toLowerCase()) && order.status.toLowerCase() !== 'returned' && (
                          <button
                            onClick={() => handleOpenReturnModal(order.orderNumber || order.orderId || order.id)}
                            style={{
                              marginTop: 12, width: '100%', padding: '10px',
                              background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8,
                              fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ffe4e6'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
                          >
                            🔄 Return Order
                          </button>
                        )}

                        {/* Track Order Button */}
                        {order.status && order.status.toLowerCase() !== 'cancelled' && (
                          <button
                            onClick={() => handleTrackOrder(order.orderNumber || order.orderId || order.id)}
                            style={{
                              marginTop: 10, width: '100%', padding: '10px',
                              background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                              borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                          >
                            📍 Track Order
                          </button>
                        )}

                        {/* Return Order Button */}
                        {order.status && order.status.toLowerCase() === 'delivered' && (
                          <button
                            onClick={() => {
                              const orderNum = order.orderNumber || order.order_number;
                              console.log('DEBUG: Full Order Object:', order);
                              handleOpenReturnModal(orderNum || order.orderId || order.id);
                            }}
                            style={{
                              marginTop: 10, width: '100%', padding: '10px',
                              background: '#fff9eb', color: '#b45309', border: '1px solid #fde68a',
                              borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff9eb'}
                          >
                            🔄 Return Order
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ordSpin { to { transform: rotate(360deg); } }
        @keyframes modalFade { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* ── Track Order Modal ── */}
      {trackModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setTrackModal({ open: false, orderId: null })}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalFade 0.3s ease-out',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg,#3BB77E,#1e9f62)',
              padding: '24px', color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Track Your Order</h3>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>Order Number: #{trackModal.orderId}</div>
                </div>
                <button onClick={() => setTrackModal({ open: false, orderId: null })}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 8px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px 24px' }}>
              {trackLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 40, gap: 12 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #3BB77E', borderRadius: '50%', animation: 'ordSpin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Fetching status...</span>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Timeline logic */}
                  {(() => {
                    const stages = [
                      { key: 'pending',   label: 'Order Placed', ico: '📝' },
                      { key: 'accepted',  label: 'Accepted',     ico: '✅', aliases: ['confirmed', 'assigned', 'accepted', 'approved'] },
                      { key: 'packed',    label: 'Packed',       ico: '📦', aliases: ['packed'] },
                      { key: 'shipped',   label: 'Shipping',     ico: '🚚', aliases: ['shipped'] },
                      { key: 'completed', label: 'Completed',    ico: '🎉', aliases: ['completed', 'delivered'] }
                    ];

                    // Determine the current status by checking tracking API first, then falling back to the main order list status
                    const parentOrder = orders.find(o => (o.orderNumber || o.orderId || o.id) === trackModal.orderId);
                    const rawStatus   = (trackData?.status || parentOrder?.status || 'pending').toLowerCase();
                    
                    const currentIdx     = stages.findIndex(s => 
                      s.key === rawStatus || (s.aliases && s.aliases.includes(rawStatus))
                    );
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{
                          position: 'absolute', left: 15, top: 10, bottom: 10,
                          width: 2, background: '#f1f5f9', zIndex: 0
                        }} />
                        <div style={{
                          position: 'absolute', left: 15, top: 10, 
                          height: `${(currentIdx / (stages.length - 1)) * 100}%`,
                          width: 2, background: '#3BB77E', zIndex: 1, transition: 'height 0.5s ease'
                        }} />

                        {stages.map((st, i) => {
                          const isActive = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={st.key} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: isActive ? '#3BB77E' : '#fff',
                                border: isActive ? 'none' : '2px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, color: isActive ? '#fff' : '#94a3b8',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(59,183,126,0.2)' : 'none',
                                transition: 'all 0.3s'
                              }}>
                                {isActive ? '✓' : i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 18 }}>{st.ico}</span>
                                  <div style={{
                                    fontSize: 15, fontWeight: isActive ? 800 : 600,
                                    color: isActive ? '#253d4e' : '#94a3b8'
                                  }}>{st.label}</div>
                                </div>
                                {isCurrent && (
                                  <div style={{ fontSize: 11, color: '#3BB77E', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Current Status
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', background: '#f8fdf9', borderTop: '1px solid #e8f5ee', textAlign: 'center' }}>
              <button 
                onClick={() => setTrackModal({ open: false, orderId: null })}
                style={{
                  padding: '10px 32px', borderRadius: 12, border: 'none',
                  background: '#3BB77E', color: '#fff', fontWeight: 800, fontSize: 14,
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,183,126,0.2)'
                }}>Got it</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Return Order Modal ── */}
      {returnModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => !returnSubmitting && setReturnModal({ open: false, orderId: null })}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalFade 0.3s ease-out',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              padding: '24px', color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Return Request</h3>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>Order ID: #{returnModal.orderId}</div>
                </div>
                <button onClick={() => setReturnModal({ open: false, orderId: null })}
                  disabled={returnSubmitting}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 8px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {returnLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'ordSpin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Fetching order details...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReturn} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Reason Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, color: '#253d4e', fontWeight: 700 }}>Why are you returning this order?</label>
                    <textarea
                      required
                      placeholder="Please describe the issue (e.g., Wrong item received, Damaged product...)"
                      value={returnForm.reason}
                      onChange={(e) => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                      style={{
                        padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0',
                        fontSize: 14, minHeight: 100, resize: 'none', outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#f59e0b'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  {/* Product Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ fontSize: 14, color: '#253d4e', fontWeight: 700 }}>
                      Select Items to Return {returnData?.items?.length > 1 && <span style={{ fontWeight: 500, color: '#64748b' }}>(Choose Batch ID)</span>}
                    </label>
                    
                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
                      {returnData?.items?.map((item) => {
                        const selectedItem = returnForm.items.find(i => i.batchId === item.batchId);
                        const isSelected = !!selectedItem;
                        const qty = selectedItem ? selectedItem.quantity : (item.boughtQuantity || item.quantity || 1);
                        const price = parseFloat(item.pricePerUnit || 0);
                        
                        return (
                          <div
                            key={item.batchId}
                            style={{
                              padding: '16px', borderRadius: 16, border: '2px solid',
                              borderColor: isSelected ? '#f59e0b' : '#f1f5f9',
                              background: isSelected ? '#fffbeb' : '#fff',
                              display: 'flex', flexDirection: 'column', gap: 12,
                              transition: 'all 0.2s', position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#253d4e' }}>{item.productName || 'Product'}</span>
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Batch ID: {item.batchId} • ₹{price.toFixed(2)}/unit</span>
                                {item.expiryDate && (
                                  <span style={{ 
                                    fontSize: 11, 
                                    color: new Date(item.expiryDate) < new Date() ? '#ef4444' : '#059669', 
                                    fontWeight: 700, marginTop: 2 
                                  }}>
                                    ⌛ Expiry: {new Date(item.expiryDate).toLocaleDateString()} 
                                    {new Date(item.expiryDate) < new Date() && ' (EXPIRED)'}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (returnData.items.length === 1 && isSelected) return; // Keep auto-selected
                                  setReturnForm(prev => {
                                    const newItems = isSelected 
                                      ? prev.items.filter(i => i.batchId !== item.batchId)
                                      : [...prev.items, { batchId: item.batchId, quantity: item.boughtQuantity || item.quantity || 1 }];
                                    return { ...prev, items: newItems };
                                  });
                                }}
                                style={{
                                  background: isSelected ? '#f59e0b' : '#ef4444',
                                  color: '#fff', border: 'none', borderRadius: 8,
                                  padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer'
                                }}
                              >
                                {isSelected ? 'SELECTED' : 'SELECT'}
                              </button>
                            </div>

                            {isSelected && (
                              <div style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: 12,
                                border: '1px dashed rgba(245, 158, 11, 0.3)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>Return Qty:</span>
                                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, border: '1px solid #fed7aa', overflow: 'hidden' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateItemQuantity(item.batchId, -1, item.boughtQuantity || item.quantity)}
                                      style={{ width: 28, height: 28, border: 'none', background: 'none', color: '#d97706', cursor: 'pointer', fontSize: 16, fontWeight: 900 }}
                                    >-</button>
                                    <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#253d4e' }}>{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateItemQuantity(item.batchId, 1, item.boughtQuantity || item.quantity)}
                                      style={{ width: 28, height: 28, border: 'none', background: 'none', color: '#d97706', cursor: 'pointer', fontSize: 16, fontWeight: 900 }}
                                    >+</button>
                                  </div>
                                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>/ max {item.boughtQuantity || item.quantity}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Subtotal</div>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>₹{(price * qty).toFixed(2)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setReturnModal({ open: false, orderId: null })}
                      disabled={returnSubmitting}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0',
                        background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={returnSubmitting || !returnForm.reason.trim() || returnForm.items.length === 0}
                      style={{
                        flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                        background: (returnSubmitting || !returnForm.reason.trim() || returnForm.items.length === 0) ? '#cbd5e1' : '#f59e0b',
                        color: '#fff', fontWeight: 800, cursor: (returnSubmitting || !returnForm.reason.trim() || returnForm.items.length === 0) ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                      }}
                    >
                      {returnSubmitting ? (
                        <>
                          <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'ordSpin 0.7s linear infinite' }} />
                          Submitting...
                        </>
                      ) : 'Submit Return'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </SiteLayout>
  );
};

export default UserOrders;
