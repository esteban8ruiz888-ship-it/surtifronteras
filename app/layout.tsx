import type { Metadata } from "next";
import { Baloo_2, Mulish } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-mulish",
});

export const metadata: Metadata = {
  title: "VENCOL — Sabor de casa",
  description:
    "Productos venezolanos que saben a casa: víveres, confitería, licores y más. Arma tu pedido y lo coordinamos por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${baloo.variable} ${mulish.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
