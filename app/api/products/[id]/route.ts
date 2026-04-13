import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

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
  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("products")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (product?.image_url) {
    const parts = product.image_url.split("/product-images/");
    if (parts[1]) {
      await admin.storage.from("product-images").remove([parts[1]]);
    }
  }

  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
