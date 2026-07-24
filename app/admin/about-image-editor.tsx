"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { saveAboutImage } from "./actions";

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (ext && EXTENSION_CONTENT_TYPE[ext]) || "application/octet-stream";
}

export function AboutImageEditor({
  imageUrl,
}: {
  imageUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: resolveContentType(file),
      });
      setPreview(blob.url);
      startTransition(async () => {
        const res = await saveAboutImage(blob.url);
        if (res.ok) router.refresh();
        else setError(res.error ?? "No se pudo guardar.");
      });
    } catch (err) {
      setError("No se pudo subir la imagen: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const res = await saveAboutImage(null);
      if (res.ok) {
        setPreview(null);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="mb-5 rounded-[14px] border border-warm-border bg-white p-4">
      <h2 className="font-heading mb-3 text-[16px] text-navy">
        Foto de &ldquo;Sobre nosotros&rdquo;
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[10px] border border-warm-border bg-slot">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-semibold uppercase text-muted">
              Sin foto
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading || pending}
            className="w-full max-w-full text-[13px] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-[12.5px] file:font-bold file:text-white"
          />
          <span className="text-[11.5px] text-muted">
            JPG, PNG, WEBP o HEIC (fotos de iPhone) — máx. 20MB
          </span>
          {(uploading || pending) && (
            <span className="text-[12.5px] text-muted">Guardando…</span>
          )}
          {preview && !uploading && !pending && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-fit cursor-pointer text-[12px] text-brand-red underline"
            >
              Quitar foto
            </button>
          )}
          {error && (
            <p className="text-[12.5px] font-semibold text-brand-red">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
