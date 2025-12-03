import axiosInstance from "../axiosInstance";

const categoryApi = {
  getPublicCategories: async (params) => {
    try {
      const res = await axiosInstance.get("/category", { params });
      if (res.data?.data) {
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching public categories:", error);
      return [];
    }
  },

  getCategories: async () => {
    try {
      const res = await axiosInstance.get("/admin/category");
      if (res.data?.data) {
        return Array.isArray(res.data.data) ? res.data.data : res.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const res = await axiosInstance.post("/admin/category", data);
      return res.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/category/${id}/update`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/category/${id}/delete`);
      return res.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export default categoryApi;
