/**
 * Metadata Utilities
 * Provides server-side and client-side metadata generation
 */

import type { Metadata } from "next";
import {
  getWholesalerBrandingServer,
  getWholesalerBranding,
} from "@/utils/apiHandler";

/**
 * Convert pathname to title
 * Examples:
 * - "/" -> "Home"
 * - "/hotels-list" -> "Hotels List"
 * - "/hotel/123" -> "Hotel / 123"
 */
export const formatPathToTitle = (pathname: string): string => {
  if (!pathname || pathname === "/") return "Home";

  return pathname
    .replace(/^\//, "") // Remove leading slash
    .replace(/\/$/, "") // Remove trailing slash
    .replace(/\//g, " / ") // Replace slashes with " / "
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
};

/**
 * Server-side metadata generation
 * Used in generateMetadata functions in pages
 * Properly sets favicon through Next.js Metadata API using dynamic API route
 */
export async function generateUnifiedMetadata({
  pathname,
  hostname,
  title,
  description,
}: {
  pathname: string;
  hostname: string;
  title?: string;
  description?: string;
}): Promise<Metadata> {
  try {
    const branding = await getWholesalerBrandingServer(hostname);

    console.log("✓ Branding loaded:", { name: branding.name, hostname });
    const pageTitle = title || formatPathToTitle(pathname);

    // Use dynamic favicon API route instead of direct logo URL
    // The /api/favicon route properly handles:
    // - Base64 image conversion to binary
    // - Domain-based branding detection
    // - Fallback to static favicon.ico
    const faviconUrl = '/api/favicon';

    return {
      title: `${pageTitle} | ${branding.name}`,
      description:
        description || `Welcome to ${branding.name} booking platform`,
      icons: {
        icon: faviconUrl,
      },
    };
  } catch (error) {
    console.error("✗ Error generating metadata:", error);

    // Fallback metadata with static favicon
    const pageTitle = title || formatPathToTitle(pathname);
    return {
      title: `${pageTitle} | Jetixia System`,
      description: description || "Welcome to Jetixia booking platform",
      icons: {
        icon: "/favicon.ico", // Static fallback from public folder
      },
    };
  }
}

/**
 * Client-side metadata updates (for CSR)
 * Updates document.title, meta description, and favicon dynamically
 * Called by BrandingMetaUpdater on route changes
 */
export async function updateClientMetadata({
  pathname,
  title,
  description,
  forceRefresh = false,
}: {
  pathname: string;
  title?: string;
  description?: string;
  forceRefresh?: boolean;
}): Promise<void> {
  // Only run in browser
  if (typeof window === "undefined") return;
  if (!document || !document.head) return;

  try {
    const branding = await getWholesalerBranding(forceRefresh);
    const pageTitle = title || formatPathToTitle(pathname);

    console.log("✓ Updating client metadata:", { pathname, brandName: branding.name });

    // Update document title
    if (document.title !== undefined) {
      document.title = `${pageTitle} | ${branding.name}`;
    }

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc && document.head) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        description || `Welcome to ${branding.name} booking platform`
      );
    }

    // Update favicon dynamically using API route
    // This ensures the favicon reflects current branding on route changes
    updateFaviconLink();
  } catch (error) {
    console.error("✗ Error updating client metadata:", error);
    // Silently fail - don't break the app, fallback favicon will be used
  }
}

/**
 * Update favicon link to use dynamic API route
 * This ensures the favicon refreshes when branding changes
 * Uses cache-busting timestamp to force browser to fetch updated favicon
 */
function updateFaviconLink(): void {
  if (typeof window === "undefined") return;
  if (!document || !document.head) return;

  try {
    // Find existing favicon link or create new one
    let faviconLink = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    
    if (faviconLink) {
      // Update existing favicon by reassigning href with cache-busting timestamp
      faviconLink.href = `/api/favicon?t=${Date.now()}`;
    } else {
      // Create new favicon link if none exists
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      faviconLink.type = "image/x-icon";
      faviconLink.href = `/api/favicon?t=${Date.now()}`;
      
      if (document.head) {
        document.head.appendChild(faviconLink);
      }
    }

    console.log("Favicon link updated successfully");
  } catch (error) {
    console.error("Error updating favicon link:", error);
    // Silently fail - don't break the app, use fallback favicon
  }
}
