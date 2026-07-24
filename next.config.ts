import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Dominio canónico: www redirige al dominio sin www, conservando la ruta.
  // Evita que buscadores vean dos sitios distintos con el mismo contenido.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.surtifronterasdelavilla.com",
          },
        ],
        destination: "https://surtifronterasdelavilla.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
