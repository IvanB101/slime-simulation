import { Archivo_Black, Roboto } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";
import Background from "@/components/Background";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const archivo = Archivo_Black({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className={`${roboto.variable} antialiased`}>
        <div>{children}</div>
        <Background />
      </body>
    </html>
  );
}
