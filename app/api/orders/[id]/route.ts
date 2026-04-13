import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { OrderItem } from "@/lib/types";

function verifyAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.status === "entregado") {
    return NextResponse.json({ error: "Ya fue marcado como entregado" }, { status: 400 });
  }

  // Descontar stock por cada item del pedido
  for (const item of order.items as OrderItem[]) {
    const { data: product } = await admin
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity);
      await admin
        .from("products")
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", item.product_id);
    }
  }

  const { data, error } = await admin
    .from("orders")
    .update({ status: "entregado" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
