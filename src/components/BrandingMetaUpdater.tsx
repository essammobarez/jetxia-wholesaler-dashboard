"use client";

/**
 * BrandingMetaUpdater Component
 * Client-side component that updates metadata on route changes
 * Handles dynamic navigation in Next.js App Router
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { updateClientMetadata } from "@/lib/metadataUtils";

export default function BrandingMetaUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    // Update metadata when pathname changes
    updateClientMetadata({ pathname });
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

