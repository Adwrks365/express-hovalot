import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FixedControls } from "@/components/layout/FixedControls";
import { ContextualPopupProvider } from "@/components/popups/ContextualPopupProvider";
import { InsytixScript } from "@/components/tracking/InsytixScript";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { isPreviewNoIndex } from "@/lib/env";
import { organizationSchema, webSiteSchema, jsonLd } from "@/lib/schema";
import "./globals.css";

/** Keep in sync with PAGE_REVALIDATE_SECONDS in @/lib/cache-config */
export const revalidate = 3600;

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "חברת הובלות מקצועית בירושלים — הובלת דירות, משרדים, אריזה ואחסון.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/media/3274-favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  ...(isPreviewNoIndex(null) ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003405",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(webSiteSchema()) }}
        />
        <InsytixScript />
      </head>
      <body className="font-sans">
        <ContextualPopupProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
          >
            דלג לתוכן
          </a>
          <Header />
          <main id="main-content" className="pb-20 sm:pb-4">
            {children}
          </main>
          <Footer />
          <FixedControls />
        </ContextualPopupProvider>
      </body>
    </html>
  );
}
