/**
 * API Handler for Wholesaler Branding
 * Provides both server-side and client-side methods to fetch branding data
 */

import { getBaseUrl } from "@/helpers/config/envConfig";

export interface WholesalerBranding {
  name: string;
  logo: string;
  navLogo?: string;
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
    
    const baseUrl = getBaseUrl();
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
      const data = json.data;
      const brandSettings = data.brandSettings || {};
      
      return {
        name: brandSettings.metaName || brandSettings.brandName || data.name || 'Jetixia System',
        logo: brandSettings.brandLogo || data.logo || '/favicon.ico',
        navLogo: brandSettings.navLogo || data.logo || brandSettings.brandLogo || '/favicon.ico',
      };
    }

    // Fallback
    return {
      name: 'Jetixia System',
      logo: '/favicon.ico',
      navLogo: '/favicon.ico',
    };
  } catch (error) {
    console.error('Error fetching wholesaler branding (server):', error);
    return {
      name: 'Jetixia System',
      logo: '/favicon.ico',
      navLogo: '/favicon.ico',
    };
  }
}

/**
 * Client-side branding fetch with localStorage caching
 * Used in client components
 */
export async function getWholesalerBranding(
  forceRefresh = false
): Promise<WholesalerBranding> {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return {
      name: 'Jetixia System',
      logo: '/favicon.ico',
      navLogo: '/favicon.ico',
    };
  }

  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedName = localStorage.getItem('wholesalerName');
    const cachedLogo = localStorage.getItem('wholesalerLogo');
    const cachedNavLogo = localStorage.getItem('wholesalerNavLogo');
    
    if (cachedName && cachedLogo) {
      return {
        name: cachedName,
        logo: cachedLogo,
        navLogo: cachedNavLogo || cachedLogo,
      };
    }
  }

  try {
    const hostname = window.location.hostname;
    const domain = extractDomain(hostname);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(
      `${baseUrl}/ui-settings/by-domain?domain=${domain}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch branding: ${response.status}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const data = json.data;
      const brandSettings = data.brandSettings || {};
      
      const branding: WholesalerBranding = {
        name: brandSettings.metaName || brandSettings.brandName || data.name || 'Jetixia System',
        logo: brandSettings.brandLogo || data.logo || '/favicon.ico',
        navLogo: brandSettings.navLogo || data.logo || brandSettings.brandLogo || '/favicon.ico',
      };

      // Cache in localStorage
      localStorage.setItem('wholesalerName', branding.name);
      localStorage.setItem('wholesalerLogo', branding.logo);
      localStorage.setItem('wholesalerNavLogo', branding.navLogo || branding.logo);

      return branding;
    }

    // Fallback
    return {
      name: 'Jetixia System',
      logo: '/favicon.ico',
      navLogo: '/favicon.ico',
    };
  } catch (error) {
    console.error('Error fetching wholesaler branding (client):', error);
    
    // Try to return cached data even on error
    const cachedName = localStorage.getItem('wholesalerName');
    const cachedLogo = localStorage.getItem('wholesalerLogo');
    const cachedNavLogo = localStorage.getItem('wholesalerNavLogo');
    
    if (cachedName && cachedLogo) {
      return { 
        name: cachedName, 
        logo: cachedLogo,
        navLogo: cachedNavLogo || cachedLogo,
      };
    }

    return {
      name: 'Jetixia System',
      logo: '/favicon.ico',
      navLogo: '/favicon.ico',
    };
  }
}

/**
 * Extract base domain from hostname
 * Examples:
 * - localhost -> jetixia (will fetch from API)
 * - admin.bdesktravel.com -> bdesktravel.com
 * - www.example.com -> example.com
 */
function extractDomain(hostname: string): string {
  // Default for localhost - let API handle jetixia domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'jetixia.com';
  }

  // Extract domain using regex
  const domainMatch = hostname.match(/(?:^|\.)([\w-]+\.\w+)$/);
  if (domainMatch && domainMatch[1]) {
    return domainMatch[1];
  }

  // Fallback: return the whole hostname
  return hostname;
}

