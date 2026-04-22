import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import AuthImage from "../../components/AuthImage";


// Toggle component for product status
const ProductStatusToggle = ({ product }) => {
  // Assume active if not explicitly 0 or false
  const [isActive, setIsActive] = useState(product.isActive === 0 || product.isActive === false ? false : true);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
        const targetId = product.id || product._id;
        const newStatus = isActive ? 0 : 1;
        
        // Use JSON if possible, otherwise FormData would be needed for multipart backends
        await api.put(`/auth/api/admin/products/update/${targetId}`, { 
            ...product, // Send existing data to satisfy potential required fields
            isActive: newStatus 
        });
        
        setIsActive(!isActive);
    } catch (err) {
        console.error("Product status toggle error:", err);
        alert("Failed to update product status.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      style={{ 
        background: isActive ? "#eaf6ed" : "#ffe5e5", 
        color: isActive ? "#3bb77e" : "#dc3545", 
        padding: "5px 12px", 
        borderRadius: "20px", 
        fontSize: "12px", 
        fontWeight: "bold", 
        border: "none", 
        cursor: loading ? "wait" : "pointer", 
        transition: "0.2s",
        marginLeft: "8px",
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "..." : (isActive ? "Active" : "Inactive")}
    </button>
  );
};

const CategoryProducts = ({ categoryName, onBack, onEditProduct, onAddBatch, onViewBatches }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        console.log(`Fetching products for category: ${categoryName}`);
        const [response, batchesResponse] = await Promise.all([
            api.get(`/auth/api/admin/categories/${categoryName}`),
            api.get(`/auth/api/admin/batches`)
        ]);

        // Extract products
        let productData = response.data?.data || response.data?.products || response.data || [];
        productData = Array.isArray(productData) ? productData : [];

        // Extract batches
        let batchesData = batchesResponse.data?.data || batchesResponse.data || [];
        batchesData = Array.isArray(batchesData) ? batchesData : [];

        // Merge batches into products to calculate accurate price and stock
        const mergedProducts = productData.map(product => {
             const prodId = product.id || product._id;
             const pBatches = batchesData.filter(b => b.productId === prodId);
             
             let displayPrice = product.price || product.sellingPrice || 0;
             let displayStock = product.stock || 0;

             if (pBatches.length > 0) {
                 const activeBatches = pBatches.filter(b => b.isActive !== false); // fallback if isActive is missing
                 const primaryBatch = activeBatches[0] || pBatches[0];
                 
                 // Prioritize totalPrice, then mrp
                 displayPrice = primaryBatch.totalPrice || primaryBatch.mrp || displayPrice;
                 
                 // Sum of stock from all active batches
                 displayStock = activeBatches.reduce((sum, b) => sum + Number(b.currentStock || 0), 0);
             }

             return { ...product, displayPrice, displayStock, batches: pBatches };
        });

        setProducts(mergedProducts);
        // 🔍 DEBUG: Log image fields from first product – remove after fixing
        if (mergedProducts.length > 0) {
          const p = mergedProducts[0];
          console.log("🖼️ DEBUG imageUrl:", p.imageUrl);
          console.log("🖼️ DEBUG image:", p.image);
          console.log("🖼️ DEBUG productImage:", p.productImage);
          console.log("🖼️ Full first product keys:", Object.keys(p));
        }

      } catch (err) {
        console.error("Error fetching category products or batches:", err);
        setError(
          err.response?.data?.message || err.response?.data?.error || "Failed to load products for this category."
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

  const handleDeleteProduct = async (product, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${product.productName || product.name || 'this product'}?`)) {
        return;
    }
    try {
        const targetId = product.id || product._id;
        await api.delete(`/auth/api/admin/products/delete/${targetId}`);
        // Remove from UI
        setProducts(prev => prev.filter(p => (p.id || p._id) !== targetId));
    } catch (err) {
        console.error("Delete product error:", err);
        alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete product.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={headerStyle}>
        <div>
          <button onClick={onBack} style={backBtnStyle}>
            &larr; Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <h1 style={titleStyle}>
              {categoryName} Products
            </h1>
            <span style={badgeStyle}>{products.length} Items</span>
          </div>
          <p style={subtitleStyle}>Manage and view all products filed under this category.</p>
        </div>
      </div>

      {/* States representation */}
      {loading ? (
        <div style={statusContainerStyle}>
          <div className="spinner" style={spinnerStyle}></div>
          <p style={{ color: "#7E7E7E", fontWeight: "500", marginTop: "15px" }}>Loading products...</p>
        </div>
      ) : error ? (
        <div style={{ ...statusContainerStyle, backgroundColor: "#fff5f5", color: "#e53e3e" }}>
          <span style={{ fontSize: "30px", marginBottom: "10px" }}>⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{...backBtnStyle, marginTop: "15px", backgroundColor: "#fff"}}>Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div style={statusContainerStyle}>
           <span style={{ fontSize: "40px", marginBottom: "10px" }}>📦</span>
          <h3 style={{ color: "#253D4E" }}>No Products Found</h3>
          <p style={{ color: "#7E7E7E" }}>This category doesn't have any products associated with it yet.</p>
        </div>
      ) : (
        <div style={gridContainerStyle}>
          {products.map((product) => (
            <div key={product._id || product.id} style={productCardStyle}>
              <div style={imageContainerStyle}>
                <AuthImage
                  dbPath={product.imageUrl || product.image || product.productImage}
                  alt={product.name || product.productName || "Product"}
                  style={imageStyle}
                />
                {product.displayStock > 0 ? (
                    <span style={inStockBadge}>In Stock: {product.displayStock}</span>
                ) : (
                    <span style={outOfStockBadge}>Out of Stock</span>
                )}
              </div>
              <div style={cardContentStyle}>
                <h3 style={productNameStyle}>{product.name || product.productName || "Unnamed Product"}</h3>
                <p style={descriptionStyle}>
                  {product.description || "No description provided."}
                </p>
                <div style={priceUnitContainer}>
                  <div style={priceBlock}>
                    <span style={priceLabel}>Price</span>
                    <span style={priceValue}>₹{product.displayPrice || "0.00"}</span>
                  </div>
                  <div style={unitBlock}>
                      {product.unit && <span style={unitBadge}>{product.unit}</span>}
                      <ProductStatusToggle product={product} />
                      <button 
                         onClick={(e) => { e.stopPropagation(); onAddBatch && onAddBatch(product); }}
                         style={{
                           background: "#eaf6ed", color: "#3bb77e", padding: "5px 12px",
                           borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                           border: "1px solid #cce5ff", cursor: "pointer", transition: "0.2s"
                         }}
                      >
                         + Batch
                      </button>
                      <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             if (!product.batches || product.batches.length === 0) {
                                  alert("Please add a batch first.");
                             } else {
                                  onViewBatches && onViewBatches(product);
                             }
                         }}
                         style={{
                           background: "#fff3cd", color: "#856404", padding: "5px 12px",
                           borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                           border: "1px solid #ffeeba", cursor: "pointer", transition: "0.2s"
                         }}
                      >
                         Batches
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onEditProduct && onEditProduct(product); }}
                         style={{
                           background: "#f0f8ff", color: "#007bff", padding: "5px 12px",
                           borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                           border: "1px solid #cce5ff", cursor: "pointer", transition: "0.2s"
                         }}
                      >
                         Edit
                      </button>
                      <button 
                         onClick={(e) => handleDeleteProduct(product, e)}
                         style={{
                           background: "#ffe5e5", color: "#dc3545", padding: "5px 12px",
                           borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                           border: "1px solid #ffc2c2", cursor: "pointer", transition: "0.2s"
                         }}
                      >
                         Delete
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---

const containerStyle = {
  background: "#fff",
  padding: "35px",
  borderRadius: "15px",
  boxShadow: "0 2px 15px rgba(0,0,0,0.03)",
  width: "100%",
  minHeight: "400px",
  animation: "fadeIn 0.3s ease-in-out"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "35px",
  borderBottom: "1px solid #f1f1f1",
  paddingBottom: "25px"
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
  transition: "all 0.2s ease"
};

const titleStyle = {
  fontSize: "32px",
  color: "#253D4E",
  margin: 0,
  textTransform: "capitalize",
  fontWeight: "bold"
};

const badgeStyle = {
    backgroundColor: "#eaf6ed",
    color: "#3bb77e",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "14px"
};

const subtitleStyle = {
  color: "#7E7E7E",
  marginTop: "8px",
  fontSize: "15px"
};

const statusContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "50px",
  background: "#f8f9fa",
  borderRadius: "12px",
  textAlign: "center"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #f3f3f3",
  borderTop: "4px solid #3bb77e",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const gridContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "25px"
};

const productCardStyle = {
  border: "1px solid #eee",
  borderRadius: "12px",
  overflow: "hidden",
  transition: "transform 0.3s, box-shadow 0.3s",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  ':hover': {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.06)"
  }
};

const imageContainerStyle = {
  width: "100%",
  height: "200px",
  position: "relative",
  backgroundColor: "#f8f9fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  transition: "transform 0.4s"
};

const inStockBadge = {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#3bb77e",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 10px",
    borderRadius: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};

const outOfStockBadge = {
    ...inStockBadge,
    backgroundColor: "#e53e3e"
};

const cardContentStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: 1
};

const productNameStyle = {
  fontSize: "18px",
  color: "#253D4E",
  margin: "0 0 8px 0",
  fontWeight: "bold",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const descriptionStyle = {
  color: "#7E7E7E",
  fontSize: "14px",
  lineHeight: "1.5",
  marginBottom: "15px",
  flex: 1,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const priceUnitContainer = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "auto",
    paddingTop: "15px",
    borderTop: "1px dashed #eee",
    gap: "15px"
};

const priceBlock = {
    display: "flex",
    flexDirection: "column"
};

const priceLabel = {
    fontSize: "12px",
    color: "#adadad",
    textTransform: "uppercase",
    fontWeight: "bold"
};

const priceValue = {
    fontSize: "22px",
    color: "#3bb77e",
    fontWeight: "800"
};

const unitBlock = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "flex-end"
};

const unitBadge = {
    backgroundColor: "#f4f6fa",
    border: "1px solid #d9e2ef",
    color: "#4F5D77",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px"
};

// Add global styles for animations
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

export default CategoryProducts;
