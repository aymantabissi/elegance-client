import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      return { success: false, message: "Please fill in all fields" };
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
    formData.append("category", newProduct.category);
    formData.append("description", newProduct.description);
    formData.append("image", newProduct.image);

    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    set((state) => ({ products: [...state.products, data.data] }));
    return { success: true, message: "Product created successfully" };
  },

  fetchProduct: async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);

      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch products failed:", res.status, text);
        return;
      }

      const data = await res.json();
      set({ products: data.data || [] });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  },

  fetchProductById: async (productId) => {
    const res = await fetch(`${API_URL}/api/products/${productId}`);
    if (!res.ok) {
      throw new Error("Product not found");
    }
    const data = await res.json();
    return data.product;
  },

  deleteProduct: async (pid) => {
    const res = await fetch(`${API_URL}/api/products/${pid}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!data.success) return { success: false, message: data.message };

    set((state) => ({
      products: state.products.filter((product) => product._id !== pid),
    }));

    return { success: true, message: data.message };
  },

  updateProduct: async (pid, updatedProduct) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${pid}`, {
        method: "PUT",
        body: updatedProduct,
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, message: data.message || "Failed to update product" };
      }

      set((state) => ({
        products: state.products.map((product) =>
          product._id === pid ? data.data : product
        ),
      }));

      return { success: true, message: "Product updated successfully" };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, message: "An error occurred while updating the product" };
    }
  },

  deleteAllProducts: async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        set({ products: [] });
        return { success: true, message: "All products deleted successfully" };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error deleting all products:", error);
      return { success: false, message: "An error occurred while deleting all products" };
    }
  },

  searchProducts: async (searchTerm) => {
    const res = await fetch(`${API_URL}/api/products/search?search=${searchTerm}`);
    const data = await res.json();
    set({ products: data.data });
  },
}));