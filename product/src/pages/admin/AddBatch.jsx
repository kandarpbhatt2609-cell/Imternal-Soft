import { useState } from "react";
import api from "../../api/axios";

// Shared specific style to match AdminDashboard forms
const nestInputStyle = { width: "100%", padding: "16px 20px", border: "1px solid #e2e9e1", borderRadius: "10px", fontSize: "15px", outline: 'none', backgroundColor: '#fff', transition: 'border 0.3s' };
const nestSubmitBtnStyle = { padding: "16px 20px", background: "#3bb77e", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 'bold', width: '100%', fontSize: '16px', transition: '0.3s' };

const AddBatch = ({ product, onBack }) => {
  // Form Data State
  const [formData, setFormData] = useState({
    batchNo: "",
    mrp: "",
    basePrice: "",
    currentStock: "",
    discount: "0",
    expiryDate: "",
    sku: "",
    unit: "",
    baseWeight: "",
    baseUnit: ""
  });
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        productId: product.id || product._id,
        batchNo: formData.batchNo,
        mrp: Number(formData.mrp),
        basePrice: Number(formData.basePrice),
        currentStock: Number(formData.currentStock),
        discount: Number(formData.discount),
        expiryDate: formData.expiryDate,
        sku: formData.sku,
        unit: formData.unit,
        baseWeight: Number(formData.baseWeight),
        baseUnit: formData.baseUnit
      };

      const response = await api.post(`/auth/api/admin/batches/add`, payload);
      
      setMessage(response.data?.message || "Batch added successfully!");
      
      // Navigate back after a short delay to show the updated list
      setTimeout(() => {
        if (onBack) onBack();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to add batch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
        {message && <div style={toastStyle}>{message}</div>}
        {error && <div style={{ ...toastStyle, backgroundColor: "#f8d7da", color: "#721c24" }}>{error}</div>}

      <div style={{ maxWidth: "800px", margin: "0 auto", display: 'flex', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Form Container */}
        <div style={{ flex: 1, padding: '50px' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: '#253D4E', fontSize: '28px', margin: 0 }}>Add Batch to Product</h2>
            {onBack && <button type="button" onClick={onBack} style={backBtnStyle}>&larr; Back</button>}
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Product Name (Disabled) */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Name</label>
              <input 
                style={{ ...nestInputStyle, backgroundColor: '#f0f0f0', color: '#666', cursor: 'not-allowed' }} 
                type="text" 
                value={product?.name || product?.productName || "Unknown Product"} 
                disabled 
              />
            </div>

            {/* Batch Details */}
            <div>
              <label style={labelStyle}>Batch Number</label>
              <input style={nestInputStyle} type="text" name="batchNo" value={formData.batchNo} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>SKU Code</label>
              <input style={nestInputStyle} type="text" name="sku" value={formData.sku} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>Expiry Date</label>
              <input style={nestInputStyle} type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>Current Stock</label>
              <input style={nestInputStyle} type="number" name="currentStock" value={formData.currentStock} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>Base Price</label>
              <input style={nestInputStyle} type="number" step="0.01" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>MRP (Maximum Retail Price)</label>
              <input style={nestInputStyle} type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>Discount (%)</label>
              <input style={nestInputStyle} type="number" step="0.01" name="discount" value={formData.discount} onChange={handleInputChange} />
            </div>

            <div>
              <label style={labelStyle}>Target Unit (e.g., bag, box)</label>
              <input style={nestInputStyle} type="text" name="unit" value={formData.unit} onChange={handleInputChange} />
            </div>

            <div>
              <label style={labelStyle}>Base Weight</label>
              <input style={nestInputStyle} type="number" step="0.01" name="baseWeight" value={formData.baseWeight} onChange={handleInputChange} />
            </div>

            <div>
              <label style={labelStyle}>Base Unit</label>
              <input style={nestInputStyle} type="text" name="baseUnit" placeholder="e.g. kg, ml" value={formData.baseUnit} onChange={handleInputChange} />
            </div>

            {/* Submit */}
            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <button type="submit" disabled={loading} style={{ ...nestSubmitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Adding Batch..." : "+ Add Batch"}
                </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
};

// --- STYLES ---

const labelStyle = { 
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#253D4E',
    fontSize: '14px' 
};

const backBtnStyle = {
    background: "#f8f9fa",
    border: "1px solid #e9ecef",
    color: "#4F5D77",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
};

const toastStyle = { 
    position: 'fixed', 
    top: '20px', 
    right: '20px', 
    padding: '15px 25px', 
    background: '#d4edda', 
    color: '#155724', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    zIndex: 1000 
};

export default AddBatch;
