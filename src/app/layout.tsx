import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "@/lib/Providers";
import { generateUnifiedMetadata } from "@/lib/metadataUtils";
import BrandingMetaUpdater from "@/components/BrandingMetaUpdater";

/**
 * Helper function for pages to generate metadata with pathname
 * Usage in any page.tsx:
 * 
 * import { generatePageMetadata } from "@/app/layout";
 * export async function generateMetadata() {
 *   return await generatePageMetadata("/your-path");
 * }
 */
export async function generatePageMetadata(
  pathname: string,
  options?: {
    title?: string;
    description?: string;
  }
): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "localhost";

  return await generateUnifiedMetadata({
    pathname,
    hostname,
    title: options?.title,
    description: options?.description,
  });
}

/**
 * Factory function for one-line metadata usage
 * Usage in any page.tsx:
 * 
 * import { createMetadata } from "@/app/layout";
 * export const generateMetadata = createMetadata("/your-path");
 */
export const createMetadata = (
  pathname: string,
  options?: {
    title?: string;
    description?: string;
  }
) => {
  return async (): Promise<Metadata> => {
    return await generatePageMetadata(pathname, options);
  };
};

/**
 * Root layout auto-metadata
 * Automatically detects pathname from headers
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "/";
  return await generatePageMetadata(pathname);
}

// Force dynamic rendering to access headers
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <BrandingMetaUpdater />
          {children}
        </body>
      </html>
    </Providers>
  );
}
