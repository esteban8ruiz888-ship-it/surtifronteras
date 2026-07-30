import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Servimos las fotos directo desde Blob, sin el optimizador de Vercel.
    // El optimizador tiene un cupo mensual y al superarlo devuelve HTTP 402
    // (imagen rota en toda la tienda). Las fotos ya se suben en buen tamaño,
    // así que no hace falta optimizarlas.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

// NOTA: no agregar acá una redirección www -> apex. Vercel ya redirige
// apex -> www a nivel de plataforma (www es el dominio principal del
// proyecto), así que hacerlo también en la app genera un bucle infinito.
// Si se quiere invertir el canónico, cambiarlo en Vercel (Settings > Domains),
// no en este archivo.

export default nextConfig;
