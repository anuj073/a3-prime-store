export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string | null;
  imageUrl: string | null;
  images: string[];
  stock: number;
  unit: string | null;
  brand: string | null;
  featured: boolean;
  active: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreSettings = {
  id: string;
  storeName: string;
  tagline: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string | null;
  logoUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string | null;
  announcement: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  freeShipMsg: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string | null;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    unit?: string;
  }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};
