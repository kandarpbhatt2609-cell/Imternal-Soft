import conf from "../conf/conf";

// Default placeholder for missing images
export const DEFAULT_PRODUCT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

/**
 * Formats the product image URL from the database path.
 * 
 * @param {string} dbImagePath - The raw image path from the database (e.g., "public\\image\\productsimages\\filename.jpg")
 * @returns {string} - The clean, fully qualified image URL for the frontend.
 */
export const formatProductImageUrl = (dbImagePath) => {
  // 1. If there's no image path, return a default placeholder
  if (!dbImagePath) return DEFAULT_PRODUCT_IMAGE;
  
  // 2. Already a full URL (e.g., starting with http, https, or data:)
  if (dbImagePath.startsWith("http") || dbImagePath.startsWith("data:")) return dbImagePath;
  
  // 3. Remove "public/" and replace the Windows "\" with regular web "/"
  // We handle both \ and / just in case, then remove the public/ prefix
  const cleanPath = dbImagePath.replace(/\\/g, '/').replace(/^public\//, '');
  
  // 4. Return the full working link using the API base URL from config
  return `${conf.API_URL}/${cleanPath}`;
};
