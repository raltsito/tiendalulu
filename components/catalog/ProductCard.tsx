import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
  onAdd?: () => void;
  index?: number;
}

export default function ProductCard({ product, onAdd, index = 0 }: Props) {
  const isAvailable = product.stock > 0;
  const delay = `${index * 60}ms`;

  return (
    <div
      className="card-appear flex flex-col"
      style={{ animationDelay: delay }}
    >
      {/* Imagen */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "4/5",
          background: "linear-gradient(135deg, #fde8f0 0%, #fce4ec 100%)",
          boxShadow: "0 4px 20px rgba(200, 80, 120, 0.10), 0 1px 4px rgba(200, 80, 120, 0.06)",
        }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e0628a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}

        {/* Overlay agotado */}
        {!isAvailable && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(30, 18, 24, 0.45)", backdropFilter: "blur(2px)" }}
          >
            <span
              className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: "var(--text-mid)",
                letterSpacing: "0.12em",
              }}
            >
              Agotado
            </span>
          </div>
        )}

        {/* Boton agregar */}
        {isAvailable && onAdd && (
          <button
            onClick={onAdd}
            className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{
              background: "linear-gradient(135deg, #e8719a 0%, #c2547a 100%)",
              boxShadow: "0 4px 12px rgba(194, 84, 122, 0.45)",
            }}
            aria-label={`Agregar ${product.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        )}

        {/* Stock badge — esquina superior izquierda si quedan pocas unidades */}
        {isAvailable && product.stock <= 3 && product.stock > 0 && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #e8719a, #c2547a)" }}
          >
            ¡Últimas!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2.5 px-0.5 flex flex-col gap-1">
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--text)" }}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            className="text-xs leading-snug line-clamp-2"
            style={{ color: "var(--text-soft)" }}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--accent)" }}
          >
            {formatPrice(product.price)}
          </span>
          {isAvailable && (
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-soft)" }}
            >
              {product.stock} pzs
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
