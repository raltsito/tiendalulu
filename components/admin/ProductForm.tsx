"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Product } from "@/lib/types";

interface Props {
  product?: Product;
  adminPassword: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Precio y stock como string para que el campo empiece vacío y el usuario escriba libremente
interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  category: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  category: "",
};

export default function ProductForm({
  product,
  adminPassword,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>(
    product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: String(product.price),
          stock: String(product.stock),
          image_url: product.image_url ?? "",
          category: product.category ?? "",
        }
      : EMPTY_FORM
  );
  const [imagePreview, setImagePreview] = useState<string>(
    product?.image_url ?? ""
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    // Precio: solo dígitos y punto decimal
    if (name === "price") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, price: value }));
      }
      return;
    }
    // Stock: solo dígitos enteros
    if (name === "stock") {
      if (value === "" || /^\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, stock: value }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressed, file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setForm((prev) => ({ ...prev, image_url: json.url }));
      setImagePreview(json.url);
    } catch (err) {
      setError("Error al subir imagen");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock, 10) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      onSuccess();
    } catch (err) {
      setError("Error al guardar el producto");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl mb-2 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#2d2d2d] text-lg">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={onCancel}
            className="text-[#9ca3af] p-1"
            aria-label="Cerrar"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {/* Imagen */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-2xl bg-[#fce4ec] overflow-hidden relative cursor-pointer border-2 border-dashed border-[#e8719a] flex items-center justify-center"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e8719a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#e8719a]">
                    Subiendo...
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            <span className="text-[#9ca3af] text-xs">
              Toca para {imagePreview ? "cambiar" : "agregar"} imagen
            </span>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#2d2d2d]">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej. Blusa floral talla M"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
            />
          </div>

          {/* Descripcion */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#2d2d2d]">
              Descripcion <span className="font-normal text-[#9ca3af]">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Detalles del producto..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors resize-none"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#2d2d2d]">
                Precio ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="Ej. 150"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#2d2d2d]">Stock</label>
              <input
                type="text"
                inputMode="numeric"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                placeholder="Ej. 10"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#2d2d2d]">
              Categoria <span className="font-normal text-[#9ca3af]">(opcional)</span>
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ej. Ropa, Accesorios..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-[#e8719a] text-white font-bold py-3 rounded-xl disabled:opacity-50 active:bg-[#c2547a] transition-colors mt-1"
          >
            {saving ? "Guardando..." : product ? "Guardar cambios" : "Agregar producto"}
          </button>
        </form>
      </div>
    </div>
  );
}
