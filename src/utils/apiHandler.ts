/**
 * API Handler for Wholesaler Branding
 * Provides both server-side and client-side methods to fetch branding data
 */

export interface WholesalerBranding {
  name: string;
  logo: string;
  navLogo?: string;
  loadingLogo?: string;
  landingBanner?: string;
  siteContent?: string;
}

/**
 * Server-side branding fetch
 * Used in generateMetadata and other server components
 */
export async function getWholesalerBrandingServer(
  hostname: string
): Promise<WholesalerBranding> {
  try {
    // Extract base domain from hostname
    const domain = extractDomain(hostname);
    
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const response = await fetch(
      `${baseUrl}/ui-settings/by-domain?domain=${domain}`,
      {
        cache: 'no-store', // Always fetch fresh data for metadata
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch branding: ${response.status}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const { data } = json;
      const brandSettings = data.brandSettings || {};
      
      // Proper data extraction according to API response structure
      return {
        name: brandSettings.metaName?.trim() || brandSettings.brandName || data.name || '',
        logo: brandSettings.brandLogo || data.logo || '',
        navLogo: brandSettings.navLogo || brandSettings.brandLogo || data.logo || '',
        loadingLogo: brandSettings.loadingLogo || '',
        landingBanner: brandSettings.landingBanner || '',
        siteContent: brandSettings.wholesalerSiteContent || '',
      };
    }

    // Fallback
    return getFallbackBranding();
  } catch (error) {
    return getFallbackBranding();
  }
}

/**
 * Client-side branding fetch
 * Always fetches fresh data from API (no caching)
 * Used in client components
 */
export async function getWholesalerBranding(
  forceRefresh = false
): Promise<WholesalerBranding> {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return getFallbackBranding();
  }

  try {
    const hostname = window.location.hostname;
    const domain = extractDomain(hostname);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const response = await fetch(
      `${baseUrl}/ui-settings/by-domain?domain=${domain}`,
      {
        cache: 'no-store', // Always fetch fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch branding: ${response.status}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const { data } = json;
      const brandSettings = data.brandSettings || {};
      
      // console.log("API Response - data:", data);
      // console.log("API Response - brandSettings:", brandSettings);
      
      // Proper data extraction according to API response structure
      const branding: WholesalerBranding = {
        name: brandSettings.metaName?.trim() || brandSettings.brandName || data.name || '',
        logo: brandSettings.brandLogo || data.logo || '',
        navLogo: brandSettings.navLogo || brandSettings.brandLogo || data.logo || '',
        loadingLogo: brandSettings.loadingLogo || '',
        landingBanner: brandSettings.landingBanner || '',
        siteContent: brandSettings.wholesalerSiteContent || '',
      };

      // console.log("Extracted branding:", branding);
      return branding;
    }

    // Fallback
    return getFallbackBranding();
  } catch (error) {
    return getFallbackBranding();
  }
}

/**
 * Fallback branding object
 * Used when API fails or returns invalid data
 */
function getFallbackBranding(): WholesalerBranding {
  return {
    name: '',
    logo: '',
    navLogo: '',
    loadingLogo: '',
    landingBanner: '',
    siteContent: '',
  };
}

/**
 * Extract base domain from hostname and return only the domain name (without extension)
 * Examples:
 * - localhost -> jetixia
 * - admin.bdesktravel.com -> bdesktravel
 * - www.example.com -> example
 * - jetixia.com -> jetixia
 */
function extractDomain(hostname: string): string {
  // Default for localhost - let API handle jetixia domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost:3001';
  }

  // Extract domain using regex (e.g., "admin.bdesktravel.com" -> "bdesktravel.com")
  const domainMatch = hostname.match(/(?:^|\.)([\w-]+\.\w+)$/);
  const fullDomain = domainMatch && domainMatch[1] ? domainMatch[1] : hostname;
  
  // Extract just the domain name without extension (e.g., "bdesktravel.com" -> "bdesktravel")
  const domainName = fullDomain.split('.')[0];
  
  return domainName;
}

