"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      sessionStorage.setItem("admin_password", password);
      router.push("/admin");
    } else {
      setError("Contrasena incorrecta");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center text-[#9ca3af] hover:text-[#e8719a] transition-colors z-40"
        aria-label="Acceso administrador"
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
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setPassword("");
              setError("");
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl mb-4">
            <h2 className="font-bold text-[#2d2d2d] text-lg mb-4">
              Acceso administrador
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contrasena"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8719a] transition-colors"
              />
              {error && (
                <p className="text-red-500 text-xs font-semibold">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-[#e8719a] text-white font-bold py-3 rounded-xl disabled:opacity-50 active:bg-[#c2547a] transition-colors"
              >
                {loading ? "Verificando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
