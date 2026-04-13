"use client";

import { useState } from "react";
import { Product, CartItem } from "@/lib/types";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import AdminButton from "./AdminButton";
import { formatPrice } from "@/lib/utils";

interface Props {
  products: Product[];
}

export default function CatalogWrapper({ products }: Props) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  }

  function removeFromCart(productId: string) {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function handleOrderPlaced() {
    setCartItems([]);
    setCartOpen(false);
  }

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e0628a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-soft)" }}
          >
            No hay productos aun
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 max-w-lg mx-auto sm:grid-cols-3 sm:max-w-2xl">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      )}

      {/* FAB carrito */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="cart-pop fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full z-40 transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #e8719a 0%, #c2547a 100%)",
            boxShadow: "0 8px 24px rgba(194, 84, 122, 0.45)",
            padding: "14px 22px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="text-white text-sm font-bold">
            Ver pedido
          </span>
          <span
            className="text-white/70 text-sm font-medium"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "12px" }}
          >
            {formatPrice(totalPrice)}
          </span>
        </button>
      )}

      <AdminButton />

      {cartOpen && (
        <Cart
          items={cartItems}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </>
  );
}
