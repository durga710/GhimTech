import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GhimTech Tax",
    template: "%s · GhimTech Tax",
  },
  description:
    "GhimTech Tax — private professional tax preparation and e-file platform. Built by GhimTech.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
