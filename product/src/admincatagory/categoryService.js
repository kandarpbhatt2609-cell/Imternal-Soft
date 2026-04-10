import api from "../api/axios";

export const getCategories = async () => {
  try {
    const response = await api.get("/auth/api/admin/categories"); 
    const result = response.data.data || response.data;
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await api.post("/auth/api/admin/categories/add", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

// 🔹 New Update Function
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/auth/api/admin/categories/update/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/auth/api/admin/categories/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};