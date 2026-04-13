"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export default function Cart({ items, onUpdateQty, onRemove, onClose, onOrderPlaced }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    }));

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name: name.trim(), customer_phone: phone.trim(), notes: notes.trim(), items: orderItems, total }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        onOrderPlaced();
      }, 2000);
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al enviar el pedido");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-[#2d2d2d] text-lg">Tu pedido</h2>
          <button onClick={onClose} className="text-[#9ca3af] p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 bg-[#fce4ec] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8719a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <p className="font-bold text-[#2d2d2d] text-lg text-center">Pedido enviado</p>
              <p className="text-[#9ca3af] text-sm text-center">En breve nos comunicamos contigo</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2d2d2d] text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-[#e8719a] text-xs font-bold">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.quantity === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#9ca3af] active:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                        </svg>
                      </button>
                      <span className="w-5 text-center font-bold text-[#2d2d2d] text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 rounded-full border border-[#e8719a] flex items-center justify-center text-[#e8719a] active:bg-[#fce4ec] transition-colors disabled:opacity-40 disabled:border-gray-200 disabled:text-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="M12 5v14"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-5">
                <span className="font-bold text-[#2d2d2d]">Total</span>
                <span className="font-black text-[#e8719a] text-lg">{formatPrice(total)}</span>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Tu nombre *"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp / telefono (opcional)"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas del pedido (opcional)"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors resize-none"
                />
                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-[#e8719a] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 active:bg-[#c2547a] transition-colors"
                >
                  {loading ? "Enviando..." : "Hacer pedido"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
