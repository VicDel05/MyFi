import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyFi — Gestión y Administración Financiera",
  description: "Sistema web de finanzas personales, control de gastos, método bola de nieve y ahorro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
