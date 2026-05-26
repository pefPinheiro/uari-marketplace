import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "UÁRI Marketplace - Painel do Lojista",
  description: "Painel de Vendas, carteira, splits, escrow e campanhas promocionais do lojista no ecossistema UÁRI Tefé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

