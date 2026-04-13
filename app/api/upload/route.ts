import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No se envio archivo" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from("product-images")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = admin.storage.from("product-images").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
