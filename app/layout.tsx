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
    images: [
      {
        url: "https://coloradowomeninstem.com/cws-logo-sqr.png",
        width: 512,
        height: 512,
        alt: "Colorado Women of Color in STEM logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Colorado Women of Color in STEM",
    description: "A community cultivating belonging and opportunity for women of color in STEM across Colorado.",
    images: ["https://coloradowomeninstem.com/cws-logo-sqr.png"],
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
