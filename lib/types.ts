export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: "pendiente" | "entregado";
  created_at: string;
}
