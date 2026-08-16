import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/chrome/AppProviders";
import { about } from "@/content/about";
import { SITE_URL } from "@/lib/site";
import { buildPersonSchema } from "@/lib/person-schema";
import "./globals.css";

// Typography system — see docs/01-design-specification.md §2. The serif is
// display/headline only, the sans is the workhorse, and mono is reserved for
// data-shaped content — which is also how the AI/ML track signals that it is
// the more instrumented of the two.
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = `${about.name} — Software & AI/ML Engineer`;
const description =
  "Portfolio of Ankit Chaudhary — full-stack systems and applied machine learning. B.Tech Computer Engineering at Pandit Deendayal Energy University, ML intern at Multitech Support & Development.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: `${about.name} — Portfolio`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Site-wide identity, not page-specific — see src/lib/person-schema.ts */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPersonSchema()) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[var(--paper)] focus:px-4 focus:py-2 focus:text-[var(--ink)] focus:outline focus:outline-2 focus:outline-[var(--focus-ring)]"
        >
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
