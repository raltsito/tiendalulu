import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_name, customer_phone, notes, items, total } = body;

  if (!customer_name || !items?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert([{ customer_name, customer_phone, notes, items, total, status: "pendiente" }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
