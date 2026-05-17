import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoRead — AI README Generator",
  description:
    "Paste any GitHub URL and get a professional, production-grade README.md in seconds. Powered by GPT-4o-mini.",
  keywords: ["readme generator", "github", "ai", "documentation", "open source"],
  authors: [{ name: "RepoRead" }],
  robots: "index, follow",
  openGraph: {
    title: "RepoRead — AI README Generator",
    description: "Generate professional READMEs for any GitHub repository in seconds.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
        {/* Ambient background glow effects */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Top-left amber gradient orb */}
          <div
            className="absolute -top-48 -left-48 w-96 h-96 rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, #F5A623 0%, transparent 70%)",
            }}
          />
          {/* Bottom-right subtle glow */}
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, #F5A623 0%, transparent 70%)",
            }}
          />
          {/* Fine grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
