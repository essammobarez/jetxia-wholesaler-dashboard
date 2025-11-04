"use client";

/**
 * BrandingMetaUpdater Component
 * Client-side component that updates metadata on route changes
 * Handles dynamic navigation in Next.js App Router
 * Always fetches fresh branding data from API
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { updateClientMetadata } from "@/lib/metadataUtils";

export default function BrandingMetaUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    // Always fetch fresh data from API and update metadata
    updateClientMetadata({ pathname, forceRefresh: true });
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

