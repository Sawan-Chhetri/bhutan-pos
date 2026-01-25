import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import OfflineBanner from "@/components/OfflineBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Swift GST - Easy GST solution for Bhutan",
  description:
    "Fast. Accurate. Audit-ready. SwiftGST is the modern GST solution designed specifically for Bhutan’s tax ecosystem. Transform your sales into verified GST reports in one click.",
  keywords: [
    "GST Bhutan",
    "Bhutan POS",
    "BRS Compliance",
    "SwiftGST",
    "Tax Ledger Bhutan",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://swiftgst-nine.vercel.app/" />
        <link rel="icon" href="/favicon.png" sizes="48x48"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <OfflineBanner />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
