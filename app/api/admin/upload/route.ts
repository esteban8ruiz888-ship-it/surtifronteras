import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

// La foto llega en un FormData; el servidor la sube a Blob con el token.
// Flujo simple (sin webhook de confirmación): si algo falla, da error claro.
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Falta el token de almacenamiento (BLOB_READ_WRITE_TOKEN) en el servidor." },
      { status: 500 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "No se pudo leer la imagen enviada." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { error: "La imagen es muy grande (máx. 4 MB). Probá con una más liviana." },
      { status: 400 },
    );
  }

  const contentType =
    file.type && ALLOWED_TYPES.has(file.type) ? file.type : "image/jpeg";

  try {
    const blob = await put(file.name || "producto.jpg", file, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo subir a Blob: " + (error as Error).message },
      { status: 500 },
    );
  }
}
