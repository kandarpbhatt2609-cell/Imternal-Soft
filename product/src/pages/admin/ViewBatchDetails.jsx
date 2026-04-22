import { useState, useEffect } from "react";
import api from "../../api/axios";

const ViewBatchDetails = ({ product, onBack }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Inline editing state
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (product && product.batches) {
      setBatches(product.batches);
    } else {
      setError("No batches found for this product.");
    }
    setLoading(false);
  }, [product]);

  const handleEditClick = (batch) => {
    setEditingBatchId(batch.id || batch._id);
    setEditFormData({
        mrp: batch.mrp,
        basePrice: batch.basePrice,
        discount: batch.discount,
        currentStock: batch.currentStock,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : "",
        isActive: batch.isActive === 1 || batch.isActive === true || batch.isActive === undefined
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
        ...editFormData,
        [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleBatchStatus = async (batch) => {
    try {
        const batchId = batch.id || batch._id;
        // Handle 0/1, true/false, and strings '0'/'1'
        const currentActive = batch.isActive === 1 || batch.isActive === true || batch.isActive === '1' || batch.isActive === undefined;
        const newStatus = currentActive ? 0 : 1;
        
        await api.put(`/auth/api/admin/batches/update/${batchId}`, {
            ...batch, // Spread existing fields to be safe
            isActive: newStatus
        });
        
        setBatches(prev => prev.map(b => (b.id || b._id) === batchId ? { ...b, isActive: newStatus } : b));
    } catch (err) {
        console.error("Status toggle error:", err);
        alert("Failed to update status.");
    }
  };

  const submitUpdate = async (batchId) => {
    try {
        const payload = {
            mrp: Number(editFormData.mrp),
            basePrice: Number(editFormData.basePrice),
            discount: Number(editFormData.discount),
            currentStock: Number(editFormData.currentStock),
            expiryDate: editFormData.expiryDate,
            isActive: editFormData.isActive
        };

        const res = await api.put(`/auth/api/admin/batches/update/${batchId}`, payload);
        
        // Calculate approx total price for local update reflection
        const discountVal = (payload.basePrice * (payload.discount || 0)) / 100;
        const newTotalPrice = payload.basePrice - discountVal;

        // Update local state directly so the table updates seamlessly
        setBatches(batches.map(b => (b.id || b._id) === batchId ? { ...b, ...payload, totalPrice: newTotalPrice } : b));
        setEditingBatchId(null);
    } catch(err) {
        alert(err.response?.data?.message || err.response?.data?.error || "Failed to update batch details.");
        console.error(err);
    }
  };

  return (
    <div style={{ background: "#fff", padding: "35px", borderRadius: "15px", boxShadow: "0 2px 15px rgba(0,0,0,0.03)", width: "100%", animation: "fadeIn 0.3s ease-in-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
        <h2 style={{ color: "#253D4E", margin: 0, textTransform: "capitalize" }}>Batch Details for {product.name || product.productName}</h2>
        <button onClick={onBack} style={{ background: "#f8f9fa", border: "1px solid #e9ecef", color: "#4F5D77", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>&larr; Back to Products</button>
      </div>

      {loading ? (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <p style={{ color: "#7E7E7E", fontWeight: "500" }}>Loading batches...</p>
        </div>
      ) : error ? (
        <div style={{ padding: "20px", background: "#fff5f5", color: "#e53e3e", borderRadius: "8px", textAlign: "center" }}>
            <p>{error}</p>
        </div>
      ) : batches.length === 0 ? (
        <div style={{ padding: "50px", textAlign: "center", background: "#f8f9fa", borderRadius: "8px" }}>
            <p style={{ color: "#7E7E7E" }}>No batches found for this product.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
                <tr>
                <th style={thStyle}>Batch No</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>MRP (₹)</th>
                <th style={thStyle}>Base (₹)</th>
                <th style={thStyle}>Disc. (%)</th>
                <th style={thStyle}>Total (₹)</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Expiry</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {batches.map((b, i) => {
                  const bId = b.id || b._id;
                  const isEditing = editingBatchId === bId;

                  return (
                    <tr key={bId || i} style={{ borderBottom: "1px solid #eee", transition: "0.2s", background: isEditing ? "#f0f8ff" : "transparent" }}>
                        <td style={{...tdStyle, fontWeight: 'bold'}}>{b.batchNo}</td>
                        <td style={tdStyle}>
                          {b.baseWeight && b.baseUnit 
                            ? `${b.baseWeight}${b.baseUnit}` 
                            : b.unit}
                        </td>
                        <td style={tdStyle}>
                          {isEditing ? <input style={inputStyle} type="number" step="0.01" name="mrp" value={editFormData.mrp} onChange={handleEditChange} /> : `₹${b.mrp}`}
                        </td>
                        
                        <td style={tdStyle}>
                          {isEditing ? <input style={inputStyle} type="number" step="0.01" name="basePrice" value={editFormData.basePrice} onChange={handleEditChange} /> : `₹${b.basePrice}`}
                        </td>
                        
                        <td style={{ ...tdStyle, color: isEditing ? 'inherit' : '#e53e3e' }}>
                          {isEditing ? <input style={inputStyle} type="number" step="0.01" name="discount" value={editFormData.discount} onChange={handleEditChange} /> : `${b.discount}%`}
                        </td>
                        
                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#3bb77e' }}>₹{b.totalPrice}</td>
                        
                        <td style={tdStyle}>
                          {isEditing ? <input style={inputStyle} type="number" name="currentStock" value={editFormData.currentStock} onChange={handleEditChange} /> : b.currentStock}
                        </td>
                        
                        <td style={tdStyle}>
                          {isEditing ? <input style={inputStyle} type="date" name="expiryDate" value={editFormData.expiryDate} onChange={handleEditChange} /> : (b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : 'N/A')}
                        </td>
                        
                        <td style={tdStyle}>
                          {isEditing ? (
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input type="checkbox" name="isActive" checked={editFormData.isActive} onChange={handleEditChange} /> Active
                              </label>
                          ) : (
                              <button 
                                onClick={() => toggleBatchStatus(b)}
                                style={{ 
                                  background: (b.isActive === 1 || b.isActive === true || b.isActive === undefined) ? "#eaf6ed" : "#ffe5e5", 
                                  color: (b.isActive === 1 || b.isActive === true || b.isActive === undefined) ? "#3bb77e" : "#dc3545", 
                                  padding: "5px 12px", 
                                  borderRadius: "20px", 
                                  fontSize: "12px", 
                                  fontWeight: "bold",
                                  border: "none",
                                  cursor: "pointer"
                                }}
                              >
                                  {(b.isActive === 1 || b.isActive === true || b.isActive === undefined) ? "Active" : "Inactive"}
                              </button>
                          )}
                        </td>

                        <td style={tdStyle}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => submitUpdate(bId)} style={{ ...btnStyle, background: "#3bb77e", color: "#fff" }}>Save</button>
                                <button onClick={() => setEditingBatchId(null)} style={{ ...btnStyle, background: "#6c757d", color: "#fff" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditClick(b)} style={{ ...btnStyle, background: "#eaf6ed", color: "#3bb77e", border: "1px solid #cce5ff" }}>Edit</button>
                          )}
                        </td>
                    </tr>
                  );
                })}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: "16px", textAlign: "left", color: "#7E7E7E", fontSize: "14px", fontWeight: "600", borderBottom: "2px solid #eee", background: "#f8f9fa" };
const tdStyle = { padding: "12px 10px", verticalAlign: "middle", fontSize: "15px", color: "#4F5D77" };
const inputStyle = { width: "70px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" };
const btnStyle = { padding: "5px 12px", borderRadius: "6px", cursor: "pointer", border: "none", fontSize: "12px", fontWeight: "bold" };

export default ViewBatchDetails;
