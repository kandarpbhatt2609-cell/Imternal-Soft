import api from "../api/axios"; // Import your new instance

export const getCategories = async () => {
  try {
    const response = await api.get("/categories"); // No need for full URL or config
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories/add", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};