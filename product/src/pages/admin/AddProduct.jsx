import { useState } from "react";
import api from "../../api/axios";
import conf from "../../conf/conf";

// Shared specific style to match AdminDashboard forms
const nestInputStyle = { width: "100%", padding: "16px 20px", border: "1px solid #e2e9e1", borderRadius: "10px", fontSize: "15px", outline: 'none', backgroundColor: '#fff', transition: 'border 0.3s' };
const nestSubmitBtnStyle = { padding: "16px 20px", background: "#3bb77e", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 'bold', width: '100%', fontSize: '16px', transition: '0.3s' };

const AddProduct = ({ categoriesList, onBack }) => {
  // Form Data State
  const [formData, setFormData] = useState({
    categoryId: "",
    productName: "",
    brand: "",
    description: "",
    cgst: "",
    sgst: "",
    igst: "",
    sellingPrice: "",
    unit: "",
    isActive: 1 // 1 for active, 0 for inactive as requested
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  
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
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Create formData for multipart/form-data request
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
        // Do not append empty strings, as backend might try to parse them as numbers and crash
        if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
            payload.append(key, formData[key]);
        }
    });
    
    if (imageFile) {
        payload.append("imageUrl", imageFile); // 'imageUrl' is the key expected by the backend
    } else {
        setError("Please select an image file.");
        setLoading(false);
        return;
    }

    try {
      const response = await api.post(`/auth/api/admin/products/add`, payload, {
        headers: {
            // Let the browser set the boundary for multipart/form-data automatically
            "Content-Type": "multipart/form-data" 
        }
      });
      
      setMessage("Product added successfully!");
      // Reset form
      setFormData({
        categoryId: "", productName: "", brand: "", description: "", cgst: "", sgst: "", igst: "", sellingPrice: "", unit: "", isActive: 1
      });
      setImageFile(null);
      setImagePreview(null);

      // Reset file input value visually
      document.getElementById("productImageInput").value = null;
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
        {message && <div style={toastStyle}>{message}</div>}
        {error && <div style={{ ...toastStyle, backgroundColor: "#f8d7da", color: "#721c24" }}>{error}</div>}

      <div style={{ maxWidth: "1100px", display: 'flex', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Form Container */}
        <div style={{ flex: 1.5, padding: '50px' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: '#253D4E', fontSize: '28px', margin: 0 }}>Add New Product</h2>
            {onBack && <button onClick={onBack} style={backBtnStyle}>&larr; Back</button>}
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

            {/* Price and Unit - New section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", gridColumn: '1 / -1' }}>
                <div>
                    <label style={labelStyle}>Selling Price (₹)</label>
                    <input style={nestInputStyle} type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} required />
                </div>
                <div>
                    <label style={labelStyle}>Unit</label>
                    <select 
                        style={{ ...nestInputStyle, appearance: 'auto' }} 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        required
                    >
                        <option value="" disabled>-- Select Unit --</option>
                        {categoriesList.find(cat => String(cat.id) === String(formData.categoryId))?.allowedUnits?.map(u => (
                            <option key={u} value={u}>{u}</option>
                        )) || <option value="" disabled>Select category first</option>}
                    </select>
                </div>
            </div>

            {/* Image Upload and Toggle - Full width */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '30px', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{...labelStyle, marginBottom: '10px', display: 'block'}}>Product Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {imagePreview && (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} 
                        />
                      )}
                      <input 
                          id="productImageInput"
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
            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <button type="submit" disabled={loading} style={{ ...nestSubmitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Adding Product..." : "+ Add Product"}
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

export default AddProduct;
