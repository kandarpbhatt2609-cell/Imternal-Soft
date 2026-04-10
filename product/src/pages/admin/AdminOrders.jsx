import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

/* ── Status colour map ────────────────────────────────────────────── */
const STATUS = {
  pending:    { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: 'Pending' },
  confirmed:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Confirmed' },
  accepted:   { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Accepted' },
  packed:     { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff', label: 'Packed' },
  shipped:    { bg: '#eff6ff', color: '#2563eb', border: '#bae6fd', label: 'Shipped' },
  delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Delivered' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed' },
  returned:   { bg: '#fef2f2', color: '#dc2626', border: '#fecdd3', label: 'Returned' },
  cancelled:  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Cancelled' },
  success:    { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Success' },
};

const getStatus = (s = '') => STATUS[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: s || 'Unknown' };

/* ── Icons ────────────────────────────────────────────────────────── */
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

const AdminOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Assign employee state
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [assigning, setAssigning] = useState({});

  // Order Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const fetchOrderDetails = async (orderId) => {
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    setErrorDetails('');
    try {
      const res = await api.get(`/auth/api/admin/orders/${orderId}`);
      if (res.data && res.data.success !== false) {
        setSelectedOrderDetails(res.data.data || res.data);
      } else {
        setErrorDetails(res.data?.message || 'Failed to fetch details');
      }
    } catch (err) {
      console.error('Order Details Error:', err);
      setErrorDetails('Failed to load order details from server.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchOrders = (showLoading = true) => {
    if (showLoading) setLoading(true);
    api.get('/auth/api/admin/orders')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        if (showLoading) setError('Failed to load orders. Please try again.');
      })
      .finally(() => { if (showLoading) setLoading(false); });
  };

  useEffect(() => {
    fetchOrders(true); // initial load with spinner

    // Auto-refresh every 5 seconds so employee status changes appear instantly
    const poller = setInterval(() => {
      fetchOrders(false); // silent background refresh — no spinner
    }, 3000);

    // Fetch employees for assignment dropdown
    api.get('/auth/api/admin/employees/all')
      .then(res => setEmployees(res.data?.data || []))
      .catch(console.error);

    return () => clearInterval(poller); // cleanup on unmount
  }, []);

  const handleAssign = async (orderId) => {
    // 🔍 Find the order to check its current status
    const order = orders.find(o => (o.orderId || o.id) === orderId);
    const status = (order?.status || '').toLowerCase();

    // 🚫 Prevent assignment if order is already assigned, packed, or finished
    const blockedStatuses = ['accepted', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'];
    
    if (blockedStatuses.includes(status)) {
        alert(`Cannot assign employee to an order that is already ${status}.`);
        return;
    }

    const empId = selectedEmployee[orderId];
    if (!empId) {
        alert('Please select an employee to assign.');
        return;
    }
    
    setAssigning(prev => ({ ...prev, [orderId]: true }));
    try {
        await api.put(`/auth/api/admin/orders/${orderId}/assign`, { employeeId: Number(empId) });
        alert('Order assigned successfully!');
        fetchOrders(); // Refresh orders to show updated status
    } catch (err) {
        console.error('Assign error:', err);
        alert(err?.response?.data?.message || err?.response?.data?.error || 'Failed to assign order');
    } finally {
        setAssigning(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
      <div className="section-card" style={{ padding: '36px 36px 64px' }}>
        {/* ── Page header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, background: 'linear-gradient(135deg,#3BB77E,#1e9f62)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 16px rgba(59,183,126,0.3)',
            }}>
              <PackageIcon />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, color: '#253d4e' }}>All Orders</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginTop: 2 }}>Track and view all customer orders</p>
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
            <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>Loading system orders…</p>
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
            <h3 style={{ fontWeight: 800, color: '#253d4e', margin: '0 0 8px', fontSize: 20 }}>No orders found</h3>
            <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: 14 }}>There are no customer orders in the system yet.</p>
          </div>
        )}

        {/* ── Orders list ── */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {orders.map((order) => {
              const st = getStatus(order.status);
              return (
                <div
                  key={order.orderId || order.id}
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
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#253d4e' }}>#{order.orderNumber || order.orderId || order.id}</div>
                      </div>
                      <div style={{ width: 1, height: 36, background: '#e2e8f0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                        <CalendarIcon />
                        {fmtDate(order.createdAt)}
                      </div>
                      <div style={{ width: 1, height: 36, background: '#e2e8f0' }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#253d4e' }}>{order.user?.username || order.user?.email || `User #${order.userId}`}</div>
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

                      {/* Order Action / View Details */}
                      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          Product Information
                        </div>
                        <button
                          onClick={() => fetchOrderDetails(order.orderId || order.id)}
                          style={{
                            background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb',
                            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                          onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                        >
                          View Full Product Details
                        </button>

                        {order.status?.toLowerCase() === 'cancelled' && (
                          <div style={{ marginTop: 16, background: '#fff1f2', border: '1px dashed #fecdd3', color: '#e11d48', padding: '10px 14px', borderRadius: '8px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            ❌ This order was cancelled
                          </div>
                        )}
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

                        {/* Assign Employee Section */}
                        <div style={{ marginTop: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                            Assign Employee
                          </div>
                          
                          {(order.employeeId || order.employee || order.assignedTo) && (
                            <div style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '6px 10px', borderRadius: 8, fontWeight: 600, border: '1px solid #bbf7d0', marginBottom: 8 }}>
                                ✓ Assigned to {order.employee?.name || order.employee?.username || `Emp #${order.employee?.id || order.employeeId || order.assignedTo}`}
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select
                              value={selectedEmployee[order.orderId || order.id] || ''}
                              onChange={(e) => setSelectedEmployee(p => ({ ...p, [order.orderId || order.id]: e.target.value }))}
                              style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569', outline: 'none' }}
                            >
                              <option value="">Select Employee...</option>
                              {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.username || emp.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(order.orderId || order.id)}
                              disabled={
                                assigning[order.orderId || order.id] || 
                                !selectedEmployee[order.orderId || order.id] ||
                                ['accepted', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'].includes((order.status || '').toLowerCase())
                              }
                              style={{ 
                                background: (!selectedEmployee[order.orderId || order.id] || ['accepted', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'].includes((order.status || '').toLowerCase())) ? '#cbd5e1' : '#3BB77E', 
                                color: 'white', border: 'none', borderRadius: 8, 
                                padding: '0 12px', fontSize: 12, fontWeight: 600, 
                                cursor: (assigning[order.orderId || order.id] || !selectedEmployee[order.orderId || order.id] || ['accepted', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'].includes((order.status || '').toLowerCase())) ? 'not-allowed' : 'pointer',
                                opacity: assigning[order.orderId || order.id] ? 0.7 : 1,
                                transition: '0.2s'
                              }}
                            >
                              {assigning[order.orderId || order.id] ? '...' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Order Details Modal ── */}
        {detailsModalOpen && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} 
            onClick={() => setDetailsModalOpen(false)}
          >
            <div 
              style={{ background: '#fff', width: '100%', maxWidth: '650px', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
              onClick={e => e.stopPropagation()}
            >
               {/* header */}
               <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8f5ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fdf9' }}>
                 <div>
                   <h2 style={{ margin: 0, fontSize: 20, color: '#253d4e' }}>Order Product Details</h2>
                   {!loadingDetails && selectedOrderDetails && (
                     <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                       Order #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                     </p>
                   )}
                 </div>
                 <button onClick={() => setDetailsModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontSize: 20, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                   &times;
                 </button>
               </div>

               {/* content */}
               <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  {loadingDetails ? (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                       <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #3BB77E', borderRadius: '50%', animation: 'ordSpin 0.8s linear infinite', marginBottom: 16 }} />
                       <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>Loading selected order details…</p>
                     </div>
                  ) : errorDetails ? (
                     <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '16px', borderRadius: '12px', fontWeight: 600 }}>
                        {errorDetails}
                     </div>
                  ) : selectedOrderDetails ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(selectedOrderDetails.items || []).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid #e8f5ee', padding: '16px', borderRadius: '16px', background: '#fff' }}>
                             <div style={{ width: 64, height: 64, borderRadius: '12px', background: '#f8fdf9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9' }}>
                               {item.imageUrl ? (
                                 <img src={item.imageUrl} alt="product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                               ) : (
                                 <span style={{ fontSize: 24 }}>🛒</span>
                               )}
                             </div>
                             
                             <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 6px 0', fontWeight: 800, color: '#253d4e', fontSize: 16 }}>{item.productName || 'Unknown Product'}</p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: 13, color: '#64748b' }}>
                                  <span><strong style={{ color: '#475569' }}>Price:</strong> ₹{parseFloat(item.pricePerUnit || 0).toFixed(2)}</span>
                                  <span><strong style={{ color: '#475569' }}>Qty:</strong> {item.quantity}</span>
                                </div>
                             </div>

                             <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                                <div style={{ fontWeight: 900, color: '#3BB77E', fontSize: 18 }}>₹{parseFloat(item.totalItemPrice || 0).toFixed(2)}</div>
                             </div>
                          </div>
                        ))}
                        {(!selectedOrderDetails.items || selectedOrderDetails.items.length === 0) && (
                          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fdf9', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No Product Information</h3>
                            <p style={{ margin: 0 }}>This order does not have any specific item details stored.</p>
                          </div>
                        )}
                     </div>
                  ) : null}
               </div>
            </div>
          </div>
        )}

      <style>{`
        @keyframes ordSpin { to { transform: rotate(360deg); } }
      `}</style>
      </div>
  );
};

export default AdminOrders;
