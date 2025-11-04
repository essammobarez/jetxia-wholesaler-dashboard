import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/Providers";
import { Montserrat } from "next/font/google";
import BrandingMetaUpdater from "@/components/BrandingMetaUpdater";
import { headers } from "next/headers";
import { generateUnifiedMetadata } from "@/lib/metadataUtils";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

/**
 * Generate metadata for server components with pathname only.
 * Hostname is automatically extracted from request headers.
 * 
 * @param pathname - Page path (e.g., "/hotels-list", "/booking/confirmation")
 * @returns Metadata object with title, description, and favicon
 * 
 * @example
 * export async function generateMetadata(): Promise<Metadata> {
 *   return await generatePageMetadata("/hotels-list");
 * }
 */
export async function generatePageMetadata(pathname: string): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "localhost";
  
  return await generateUnifiedMetadata({ pathname, hostname });
}

/**
 * Factory function that creates metadata generator (ONE-LINE approach).
 * Use this for static pages without dynamic params.
 * 
 * @param pathname - Page path (e.g., "/hotels-list")
 * @param options - Optional title and description overrides
 * @returns Async function that generates metadata
 * 
 * @example
 * export const generateMetadata = createMetadata("/hotels-list");
 * export const generateMetadata = createMetadata("/hotels-list", { title: "Hotels" });
 */
export const createMetadata = (
  pathname: string,
  options?: {
    title?: string;
    description?: string;
  }
) => {
  return async (): Promise<Metadata> => {
    const headersList = await headers();
    const hostname = headersList.get("host") || "localhost";
    
    return await generateUnifiedMetadata({
      pathname,
      hostname,
      title: options?.title,
      description: options?.description,
    });
  };
};

/**
 * Root layout metadata - automatically uses current pathname from headers
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "/";
  
  return await generatePageMetadata(pathname);
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
        </head>
        <body className={`${montserrat.variable} font-sans antialiased`} suppressHydrationWarning>
          <BrandingMetaUpdater />
          {children}
        </body>
      </html>
    </Providers>
  );
}
