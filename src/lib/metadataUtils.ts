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
    const pageTitle = title || formatPathToTitle(pathname);

    return {
      title: `${pageTitle} | ${branding.name}`,
      description:
        description || `Welcome to ${branding.name} booking platform`,
      icons: {
        icon: branding.logo,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Fallback metadata
    const pageTitle = title || formatPathToTitle(pathname);
    return {
      title: `${pageTitle} | Jetixia System`,
      description: description || "Welcome to Jetixia booking platform",
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

/**
 * Client-side metadata updates (for CSR)
 * Updates document.title, meta description, and favicon dynamically
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

    // Update favicon safely
    if (branding.logo) {
      let icon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement;
      if (!icon && document.head) {
        icon = document.createElement("link");
        icon.setAttribute("rel", "icon");
        icon.setAttribute("type", "image/x-icon");
        document.head.appendChild(icon);
      }
      if (icon) {
        icon.setAttribute("href", branding.logo);
      }
    }
  } catch (error) {
    console.error("Error updating client metadata:", error);
    // Silently fail - don't break the app
  }
}

