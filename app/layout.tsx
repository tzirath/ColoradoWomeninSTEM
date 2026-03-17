import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Colorado Women in STEM",
  description:
    "Colorado Women in STEM cultivates community, confidence, and opportunity for women pursuing Science, Technology, Engineering, and Mathematics in the Denver metro area.",
  icons: { icon: "/cws-logo.png" },
  openGraph: {
    title: "Colorado Women in STEM",
    description:
      "A community cultivating belonging and opportunity for women in STEM across Colorado.",
    url: "https://coloradowomeninstem.com",
    siteName: "Colorado Women in STEM",
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
