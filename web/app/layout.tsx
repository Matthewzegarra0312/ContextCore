import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextCore",
  description: "Memoria compartida y viva para los agentes de código de tu equipo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
