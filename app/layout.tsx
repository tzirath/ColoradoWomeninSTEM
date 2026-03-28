import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Colorado Women of Color in STEM",
  description:
    "Colorado Women of Color in STEM cultivates community, confidence, and opportunity for women pursuing Science, Technology, Engineering, and Mathematics in the Denver metro area.",
  icons: { icon: "/cws-logo.png" },
  openGraph: {
    title: "Colorado Women of Color in STEM",
    description:
      "A community cultivating belonging and opportunity for women of color in STEM across Colorado.",
    url: "https://coloradowomeninstem.com",
    siteName: "Colorado Women of Color in STEM",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
