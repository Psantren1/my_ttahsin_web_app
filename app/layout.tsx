import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Baitul Huffaz - Sistem Manajemen Tahsin Al-Qur'an",
  description: "Aplikasi manajemen lembaga tahfizh Al-Qur'an Baitul Huffaz",
  keywords: ["tahfizh", "al-quran", "Tahsin", "islam", "pendidikan"],
  authors: [{ name: "Baitul Huffaz" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider><AuthProvider>{children}</AuthProvider></QueryProvider>
      </body>
    </html>
  );
}
