import { NextRequest, NextResponse } from "next/server";
import { supabase, createAdminClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("products")
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
