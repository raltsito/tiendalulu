"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";
import OrdersPanel from "@/components/admin/OrdersPanel";

export default function AdminPage() {
  const router = useRouter();
  const [adminPassword, setAdminPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const pwd = sessionStorage.getItem("admin_password");
    if (!pwd) {
      router.replace("/");
      return;
    }
    setAdminPassword(pwd);
  }, [router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (adminPassword) {
      fetchProducts();
      fetchPendingCount();
    }
  }, [adminPassword, fetchProducts]);

  async function fetchPendingCount() {
    const res = await fetch("/api/orders", {
      headers: { "x-admin-password": sessionStorage.getItem("admin_password") ?? "" },
    });
    if (res.ok) {
      const data = await res.json();
      setPendingCount(data.filter((o: { status: string }) => o.status === "pendiente").length);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este producto?")) return;
    setDeleting(id);

    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": adminPassword },
    });

    setDeleting(null);
    fetchProducts();
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    fetchProducts();
  }

  if (!adminPassword) return null;

  return (
    <main className="min-h-screen bg-[#fce4ec]">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 flex items-center justify-between max-w-lg mx-auto">
        <div>
          <h1 className="text-xl font-black text-[#2d2d2d]">Panel admin</h1>
          <p className="text-[#9ca3af] text-xs font-semibold mt-0.5">
            La Tienda de Lulú
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOrdersOpen(true)}
            className="relative flex items-center gap-2 bg-white text-[#e8719a] border border-[#e8719a] text-sm font-bold px-4 py-2.5 rounded-xl active:bg-[#fce4ec] transition-colors"
          >
            Mis pedidos
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e8719a] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 bg-[#e8719a] text-white text-sm font-bold px-4 py-2.5 rounded-xl active:bg-[#c2547a] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Agregar
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_password");
              router.push("/");
            }}
            className="text-[#9ca3af] p-2"
            aria-label="Salir"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Lista de productos */}
      <section className="px-4 pb-24 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e8719a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[#9ca3af] font-semibold text-sm">
              No hay productos. Agrega el primero.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#fce4ec] flex-shrink-0 relative">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e8719a"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2d2d2d] text-sm leading-tight line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-[#e8719a] text-xs font-bold mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                  <p
                    className={`text-xs mt-0.5 font-semibold ${
                      product.stock > 0 ? "text-[#9ca3af]" : "text-red-400"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} en stock`
                      : "Agotado"}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditing(product);
                      setFormOpen(true);
                    }}
                    className="p-2 text-[#9ca3af] active:text-[#e8719a] transition-colors"
                    aria-label="Editar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="p-2 text-[#9ca3af] active:text-red-500 transition-colors disabled:opacity-40"
                    aria-label="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {formOpen && (
        <ProductForm
          product={editing}
          adminPassword={adminPassword}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      {ordersOpen && (
        <OrdersPanel
          adminPassword={adminPassword}
          onClose={() => {
            setOrdersOpen(false);
            fetchPendingCount();
          }}
          onOrderDelivered={() => {
            fetchProducts();
            fetchPendingCount();
          }}
        />
      )}
    </main>
  );
}
