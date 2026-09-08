import type { Metadata } from "next";
import { SearchDialog } from "@/components/search-popup/search-dialog";
import "./globals.css";
import { Providers } from "./providers";
import { Noto_Serif, Public_Sans } from "next/font/google";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineLog",
  description: "Your Personal Movie Log",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <SearchDialog />
        </Providers>
      </body>
    </html>
  );
}
