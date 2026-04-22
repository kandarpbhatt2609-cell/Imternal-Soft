import { useState, useEffect } from "react";
import api from "../../api/axios";
import conf from "../../conf/conf";
import AuthImage from "../../components/AuthImage";



// Shared specific style to match AdminDashboard forms
const nestInputStyle = { width: "100%", padding: "16px 20px", border: "1px solid #e2e9e1", borderRadius: "10px", fontSize: "15px", outline: 'none', backgroundColor: '#fff', transition: 'border 0.3s' };
const nestSubmitBtnStyle = { padding: "16px 20px", background: "#3bb77e", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 'bold', width: '100%', fontSize: '16px', transition: '0.3s' };

const UpdateProduct = ({ categoriesList, product, onBack }) => {
  // Form Data State initialized to product data
  const [formData, setFormData] = useState({
    categoryId: product?.categoryId || "",
    productName: product?.productName || product?.name || "",
    brand: product?.brand || "",
    description: product?.description || "",
    cgst: product?.cgst || "",
    sgst: product?.sgst || "",
    igst: product?.igst || "",
    isActive: product?.isActive !== undefined && product?.isActive !== null ? (product.isActive ? 1 : 0) : 1
  });

  const [imageFile, setImageFile] = useState(null);
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: prev.isActive === 1 ? 0 : 1 }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Use FormData structure consistent with typical multipart handling 
    // for updating if there's an image
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
        // Only append defined values and non-empty strings
        if(formData[key] !== undefined && formData[key] !== null && formData[key] !== "") {
            payload.append(key, formData[key]);
        }
    });

    if (imageFile) {
        payload.append("imageUrl", imageFile); 
    }

    try {
      const targetId = product.id || product._id;
      const response = await api.put(`/auth/api/admin/products/update/${targetId}`, payload, {
        headers: {
            "Content-Type": "multipart/form-data" 
        }
      });
      
      setMessage("Product updated successfully!");
      // Optionally go back to the previous screen automatically after a short delay
      setTimeout(() => {
          if(onBack) onBack();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
      return (
          <div style={{ padding: "50px", textAlign: "center", background: "#fff", borderRadius: "15px" }}>
              <h2>No Product Selected</h2>
              <button onClick={onBack} style={{...nestSubmitBtnStyle, width: "auto", marginTop: "20px"}}>Return to Products</button>
          </div>
      );
  }

  return (
    <div style={{ padding: 0, animation: "fadeIn 0.3s ease-in-out" }}>
        {message && <div style={toastStyle}>{message}</div>}
        {error && <div style={{ ...toastStyle, backgroundColor: "#f8d7da", color: "#721c24" }}>{error}</div>}

      <div style={{ maxWidth: "1100px", display: 'flex', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Form Container */}
        <div style={{ flex: 1.5, padding: '50px' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: '#253D4E', fontSize: '28px', margin: 0 }}>Update Product</h2>
            {onBack && <button type="button" onClick={onBack} style={backBtnStyle}>&larr; Back</button>}
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Category Dropdown - Full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Category</label>
              <select 
                style={{ ...nestInputStyle, appearance: 'auto' }} 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleInputChange} 
                required
              >
                <option value="" disabled>-- Select a Category --</option>
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            {/* Standard Inputs */}
            <div>
              <label style={labelStyle}>Product Name</label>
              <input style={nestInputStyle} type="text" name="productName" value={formData.productName} onChange={handleInputChange} required />
            </div>

            <div>
              <label style={labelStyle}>Brand Name</label>
              <input style={nestInputStyle} type="text" name="brand" value={formData.brand} onChange={handleInputChange} />
            </div>

            {/* Description - Full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Description</label>
              <textarea 
                style={{ ...nestInputStyle, minHeight: '100px', resize: 'vertical' }} 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", gridColumn: '1 / -1' }}>
                <div>
                    <label style={labelStyle}>CGST (%)</label>
                    <input style={nestInputStyle} type="number" step="0.01" name="cgst" value={formData.cgst} onChange={handleInputChange} />
                </div>
                <div>
                    <label style={labelStyle}>SGST (%)</label>
                    <input style={nestInputStyle} type="number" step="0.01" name="sgst" value={formData.sgst} onChange={handleInputChange} />
                </div>
                <div>
                    <label style={labelStyle}>IGST (%)</label>
                    <input style={nestInputStyle} type="number" step="0.01" name="igst" value={formData.igst} onChange={handleInputChange} />
                </div>
            </div>

            {/* Image Upload and Toggle - Full width */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '30px', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{...labelStyle, marginBottom: '10px', display: 'block'}}>Replace Image (Optional)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {product.image || product.productImage || product.imageUrl ? (
                           <AuthImage
                            dbPath={product.image || product.productImage || product.imageUrl}
                            alt="Current"
                            style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd'}}
                          />
                      ) : null}
                      <input 
                          id="productImageInputUpdate"
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: '#fff', width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{...labelStyle, marginBottom: '10px'}}>Product Status</label>
                    <button 
                        type="button"
                        onClick={handleToggle} 
                        style={{ 
                            background: formData.isActive ? "#d1e7dd" : "#f8d7da", 
                            color: formData.isActive ? "#0f5132" : "#842029", 
                            padding: "10px 20px", 
                            borderRadius: "30px", 
                            fontSize: "14px", 
                            fontWeight: "bold", 
                            border: "none", 
                            cursor: "pointer", 
                            transition: "0.2s",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {formData.isActive ? (
                            <><span style={{width: 10, height: 10, background: '#0f5132', borderRadius: '50%', display: 'inline-block'}}></span> Active Product</>
                        ) : (
                            <><span style={{width: 10, height: 10, background: '#842029', borderRadius: '50%', display: 'inline-block'}}></span> Inactive / Hidden</>
                        )}
                    </button>
                </div>
            </div>

            {/* Submit */}
            <div style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button type="submit" disabled={loading} style={{ ...nestSubmitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Saving Changes..." : "Save Product Details"}
                </button>
                <button type="button" onClick={onBack} disabled={loading} style={{ ...nestSubmitBtnStyle, background: "#f8f9fa", color: "#4F5D77", border: "1px solid #ddd" }}>
                    Cancel
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

export default UpdateProduct;
