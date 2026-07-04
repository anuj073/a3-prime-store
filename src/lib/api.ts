import type { Product, Category, StoreSettings, Order } from "./types";

const API_BASE = "";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Products
  getProducts: (params?: { category?: string; search?: string; featured?: boolean; admin?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.featured) q.set("featured", "true");
    if (params?.admin) q.set("admin", "true");
    return fetchJson<Product[]>(`/api/products?${q.toString()}`);
  },
  getProduct: (id: string) => fetchJson<Product>(`/api/products/${id}`),
  createProduct: (data: Partial<Product>, token: string) =>
    fetchJson<Product>(`/api/products`, { method: "POST", body: JSON.stringify(data), headers: { "x-admin-token": token } }),
  updateProduct: (id: string, data: Partial<Product>, token: string) =>
    fetchJson<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { "x-admin-token": token } }),
  deleteProduct: (id: string, token: string) =>
    fetchJson<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE", headers: { "x-admin-token": token } }),

  // Categories
  getCategories: () => fetchJson<Category[]>(`/api/categories`),
  createCategory: (data: Partial<Category>, token: string) =>
    fetchJson<Category>(`/api/categories`, { method: "POST", body: JSON.stringify(data), headers: { "x-admin-token": token } }),
  updateCategory: (id: string, data: Partial<Category>, token: string) =>
    fetchJson<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { "x-admin-token": token } }),
  deleteCategory: (id: string, token: string) =>
    fetchJson<{ success: boolean }>(`/api/categories/${id}`, { method: "DELETE", headers: { "x-admin-token": token } }),

  // Settings
  getSettings: () => fetchJson<StoreSettings>(`/api/settings`),
  updateSettings: (data: Partial<StoreSettings> & { adminPassword?: string }, token: string) =>
    fetchJson<StoreSettings>(`/api/settings`, { method: "PUT", body: JSON.stringify(data), headers: { "x-admin-token": token } }),

  // Auth
  login: (password: string) =>
    fetchJson<{ token: string; storeName: string }>(`/api/auth`, { method: "POST", body: JSON.stringify({ password }) }),

  // Orders
  getOrders: (token: string) =>
    fetchJson<Order[]>(`/api/orders`, { headers: { "x-admin-token": token } }),
  createOrder: (data: any) =>
    fetchJson<Order>(`/api/orders`, { method: "POST", body: JSON.stringify(data) }),

  // Upload (FormData)
  uploadImage: async (file: File, token: string): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload`, { method: "POST", headers: { "x-admin-token": token }, body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  // Seed
  seed: () => fetchJson(`/api/seed`, { method: "POST" }),
};
