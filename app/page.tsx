import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import CatalogWrapper from "@/components/catalog/CatalogWrapper";

export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-8 text-center header-reveal">
        {/* Etiqueta superior */}
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full px-4 py-1.5 mb-5 shadow-sm">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-mid)" }}
          >
            Catalogo oficial
          </span>
        </div>

        {/* Nombre de la tienda */}
        <h1
          className="text-5xl leading-[1.1] mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          La Tienda
          <br />
          <em style={{ color: "var(--accent)" }}>de Lulú</em>
        </h1>

        {/* Separador decorativo */}
        <div className="divider-dots my-4">
          <span />
          <span />
          <span />
        </div>

        {/* Contador de productos */}
        <p
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-soft)" }}
        >
          {products.length > 0
            ? `${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}`
            : "Productos disponibles"}
        </p>
      </header>

      {/* Grid */}
      <section className="relative z-10 px-4 pb-32">
        <CatalogWrapper products={products} />
      </section>
    </main>
  );
}
