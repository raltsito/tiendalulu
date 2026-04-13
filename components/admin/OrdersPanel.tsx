"use client";

import { useState, useEffect, useCallback } from "react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  adminPassword: string;
  onClose: () => void;
  onOrderDelivered?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function OrdersPanel({ adminPassword, onClose, onOrderDelivered }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendiente" | "todos">("pendiente");
  const [delivering, setDelivering] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/orders", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [adminPassword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleDeliver(orderId: string) {
    setDelivering(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "x-admin-password": adminPassword },
    });
    setDelivering(null);
    fetchOrders();
    onOrderDelivered?.();
  }

  const filtered = filter === "pendiente"
    ? orders.filter((o) => o.status === "pendiente")
    : orders;

  const pendingCount = orders.filter((o) => o.status === "pendiente").length;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#2d2d2d] text-lg">Pedidos</h2>
            {pendingCount > 0 && (
              <span className="bg-[#e8719a] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[#9ca3af] p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Filtro */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => setFilter("pendiente")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === "pendiente"
                ? "bg-[#e8719a] text-white"
                : "bg-gray-100 text-[#9ca3af]"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter("todos")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === "todos"
                ? "bg-[#e8719a] text-white"
                : "bg-gray-100 text-[#9ca3af]"
            }`}
          >
            Todos
          </button>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#e8719a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-[#9ca3af] font-semibold text-sm">
                {filter === "pendiente" ? "No hay pedidos pendientes" : "No hay pedidos aun"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                    order.status === "entregado"
                      ? "border-gray-100 bg-gray-50 opacity-70"
                      : "border-[#fce4ec] bg-white shadow-sm"
                  }`}
                >
                  {/* Cliente */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#2d2d2d] text-sm">{order.customer_name}</p>
                      {order.customer_phone && (
                        <p className="text-[#9ca3af] text-xs">{order.customer_phone}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[#9ca3af] text-xs">{timeAgo(order.created_at)}</span>
                      {order.status === "entregado" && (
                        <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          Entregado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-[#2d2d2d] text-xs">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-[#9ca3af] text-xs">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notas */}
                  {order.notes && (
                    <p className="text-[#9ca3af] text-xs italic border-t border-gray-100 pt-2">
                      {order.notes}
                    </p>
                  )}

                  {/* Total + Boton */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="font-black text-[#e8719a] text-base">
                      {formatPrice(order.total)}
                    </span>
                    {order.status === "pendiente" && (
                      <button
                        onClick={() => handleDeliver(order.id)}
                        disabled={delivering === order.id}
                        className="flex items-center gap-1.5 bg-[#e8719a] text-white text-xs font-bold px-4 py-2.5 rounded-xl active:bg-[#c2547a] transition-colors disabled:opacity-50"
                      >
                        {delivering === order.id ? (
                          "Procesando..."
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            Pedido entregado
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
