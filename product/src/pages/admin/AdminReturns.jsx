import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

/* ── Status colour map ────────────────────────────────────────────── */
const STATUS = {
  pending:   { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: 'Pending' },
  accepted:  { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Accepted' },
  rejected:  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: 'Rejected' },
  completed: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Completed' },
};

const getStatus = (s = '') => STATUS[s.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: s || 'Pending' };

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchReturns = (showLoading = true) => {
    if (showLoading) setLoading(true);
    api.get('/auth/api/admin/returns')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setReturns(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Fetch returns error:', err);
        if (showLoading) setError('Failed to load return requests.');
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  const fetchReturnDetails = async (id) => {
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    setSelectedReturnDetails(null);
    try {
      // Updated to the correct endpoint confirmed by your Postman screenshot
      const res = await api.get(`/auth/api/admin/returns/${id}`);
      setSelectedReturnDetails(res.data?.data || res.data);
    } catch (err) {
      console.error('Return details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchReturns(true);
    const poller = setInterval(() => fetchReturns(false), 3000);
    return () => clearInterval(poller);
  }, []);

  const handleUpdateStatus = async (returnId, newStatus) => {
    // Map 'accepted' to 'returned' as per user request to sync status across dashboards
    const targetStatus = newStatus === 'accepted' ? 'returned' : 'rejected';
    
    if (!window.confirm(`Are you sure you want to mark this return as ${targetStatus}?`)) return;

    setProcessing(prev => ({ ...prev, [returnId]: true }));
    try {
      if (newStatus === 'accepted') {
        // Correcting the redundant prefix from the previous update
        await api.put(`/auth/api/admin/returns/${returnId}/accept`, { status: 'returned' });
      } else {
        // For rejection, keep the existing update pattern (unless a specific /reject endpoint is provided later)
        try {
          await api.put(`/auth/api/admin/returns/update/${returnId}`, { status: 'rejected' });
        } catch (rejErr) {
          await api.put(`/auth/api/admin/returns/${returnId}/status`, { status: 'rejected' });
        }
      }
      
      alert(`Return marked as ${targetStatus} successfully!`);
      fetchReturns(false);
    } catch (err) {
      console.error('Update return error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update return status. Please check your backend endpoint.";
      alert(`Error: ${msg}`);
    } finally {
      setProcessing(prev => ({ ...prev, [returnId]: false }));
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>⌛ Loading return requests...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>⚠️ {error}</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#253D4E', margin: 0 }}>Return Requests</h1>
          <p style={{ color: '#7E7E7E', marginTop: 5 }}>Manage product returns and quality claims.</p>
        </div>
        <div style={{ background: '#fff', padding: '8px 16px', borderRadius: 12, border: '1px solid #eee', fontSize: 13, fontWeight: 700, color: '#3BB77E' }}>
          Total Requests: {returns.length}
        </div>
      </div>

      {returns.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 40, marginBottom: 15 }}>📦</div>
          <h3 style={{ color: '#253d4e', margin: 0 }}>No returns found</h3>
          <p style={{ color: '#64748b', marginTop: 10 }}>All return requests have been processed.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={thStyle}>Order / Return ID</th>
                <th style={thStyle}>Customer Details</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Items Summary</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((req) => {
                const s = getStatus(req.status || 'pending');
                const isBusy = processing[req.id || req._id];
                const returnId = req.id || req._id;

                return (
                  <tr key={returnId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 800, color: '#253d4e' }}>#{req.orderNumber}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>ID: {returnId}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#3BB77E' }}>{req.username || 'User'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: '#4b5563', fontStyle: 'italic', maxWidth: 200 }}>
                        "{req.reason}"
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {req.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={{ fontSize: 12, color: '#1f2937' }}>
                            • {item.productName || 'Item'} (x{item.quantity})
                          </div>
                        ))}
                        {req.items?.length > 2 && <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>+{req.items.length - 2} more items</div>}
                        <button 
                          onClick={() => fetchReturnDetails(returnId)}
                          style={{ 
                            background: 'none', border: 'none', color: '#3BB77E', 
                            fontSize: 11, fontWeight: 800, textAlign: 'left', 
                            cursor: 'pointer', padding: '2px 0' 
                          }}
                        >
                          View Full Details →
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800 
                      }}>
                        {s.label.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {(req.status?.toLowerCase() === 'pending' || !req.status) && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(returnId, 'accepted')}
                            style={{ 
                              background: '#3BB77E', color: '#fff', border: 'none', 
                              padding: '6px 12px', borderRadius: 8, fontSize: 12, 
                              fontWeight: 700, cursor: 'pointer' 
                            }}
                          >
                            Accept
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(returnId, 'rejected')}
                            style={{ 
                              background: '#fff', color: '#ef4444', border: '1px solid #fecdd3', 
                              padding: '6px 12px', borderRadius: 8, fontSize: 12, 
                              fontWeight: 700, cursor: 'pointer' 
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status?.toLowerCase() === 'returned' && (
                         <div style={{ fontSize: 12, color: '#3BB77E', fontWeight: 700 }}>✓ Returned</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Return Details Modal ── */}
      {detailsModalOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} 
          onClick={() => setDetailsModalOpen(false)}
        >
          <div 
            style={{ background: '#fff', width: '100%', maxWidth: '750px', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
            onClick={e => e.stopPropagation()}
          >
             {/* header */}
             <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8f5ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fdf9' }}>
               <div>
                 <h2 style={{ margin: 0, fontSize: 20, color: '#253d4e' }}>Return Request Details</h2>
                 {selectedReturnDetails && (
                   <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Order #{selectedReturnDetails.orderNumber}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Return ID: #{selectedReturnDetails.id}</span>
                   </div>
                 )}
               </div>
               <button onClick={() => setDetailsModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontSize: 20, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 &times;
               </button>
             </div>

             {/* content */}
             <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {loadingDetails ? (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                     <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #3BB77E', borderRadius: '50%', animation: 'retSpin 0.8s linear infinite', marginBottom: 16 }} />
                     <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>Fetching details…</p>
                   </div>
                ) : selectedReturnDetails ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Top Info Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                         <div style={{ background: '#fff9f0', border: '1px solid #fee2e2', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: 4 }}>Return Reason</div>
                            <p style={{ margin: 0, color: '#1f2937', fontWeight: 600, fontSize: 14 }}>"{selectedReturnDetails.reason}"</p>
                         </div>
                         <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>Total Refund Amount</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>₹{selectedReturnDetails.totalRefundAmount}</div>
                         </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                           <span>📦 Products to be Returned</span>
                           <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {(selectedReturnDetails.items || []).map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', gap: '20px', alignItems: 'center', 
                              border: '1.5px solid #f1f5f9', padding: '16px', borderRadius: '20px', 
                              background: '#fff', position: 'relative', overflow: 'hidden'
                            }}>
                               {/* Image */}
                               <div style={{ width: 80, height: 80, borderRadius: '14px', background: '#f8fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9' }}>
                                 {item.imageUrl ? (
                                   <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                                 ) : (
                                   <span style={{ fontSize: 28 }}>🥗</span>
                                 )}
                               </div>
                               
                               {/* Main Data */}
                               <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: '#3BB77E', marginBottom: 2 }}>{item.brand}</div>
                                        <h3 style={{ margin: '0 0 6px 0', fontWeight: 900, color: '#253d4e', fontSize: 18 }}>{item.productName}</h3>
                                     </div>
                                     <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Refund</div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>₹{item.refundAmount}</div>
                                     </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10, background: '#f9fafb', padding: '10px 14px', borderRadius: '12px', border: '1px solid #eee' }}>
                                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>SKU Info</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>{item.sku}</span>
                                     </div>
                                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>Batch / Unit</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>{item.batchNo} ({item.unit})</span>
                                     </div>
                                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>Price / Qty</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>₹{item.mrp} x {item.quantity}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Details Footer */}
                      <div style={{ borderTop: '2.5px dashed #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#16a34a', border: '1px solid #dcfce7' }}>👤</div>
                            <div>
                               <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Requested By</div>
                               <div style={{ fontWeight: 800, color: '#253d4e', fontSize: 15 }}>{selectedReturnDetails.username || 'Customer'}</div>
                            </div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Submission Date & Time</div>
                            <div style={{ fontWeight: 700, color: '#4b5563', fontSize: 13 }}>{new Date(selectedReturnDetails.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</div>
                         </div>
                      </div>
                   </div>
                ) : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No details found for this request.</div>}
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes retSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const thStyle = { padding: '16px 20px', textAlign: 'left', fontSize: 13, color: '#64748b', fontWeight: 700, borderBottom: '2px solid #f1f5f9' };
const tdStyle = { padding: '16px 20px', verticalAlign: 'top' };

export default AdminReturns;
