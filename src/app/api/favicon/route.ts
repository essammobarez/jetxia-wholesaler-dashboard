import { NextRequest, NextResponse } from 'next/server';
import { getWholesalerBrandingServer } from '@/utils/apiHandler';

/**
 * Dynamic Favicon API Route
 * Serves the wholesaler's brand logo as favicon based on the request hostname
 * Handles base64 images and returns proper image response
 */
export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || 'localhost';
    const branding = await getWholesalerBrandingServer(hostname);

    // If logo is a base64 string, convert it to binary
    if (branding.logo && branding.logo.startsWith('data:image')) {
      const base64Data = branding.logo.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Extract mime type from base64 string
      const mimeMatch = branding.logo.match(/data:(image\/[^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/x-icon';

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      });
    }

    // If logo is a URL, redirect to it
    if (branding.logo && (branding.logo.startsWith('http://') || branding.logo.startsWith('https://'))) {
      return NextResponse.redirect(branding.logo);
    }

    // Fallback to default favicon
    return NextResponse.redirect(new URL('/favicon.ico', request.url));
  } catch (error) {
    console.error('Error serving dynamic favicon:', error);
    
    // Fallback to default favicon on error
    return NextResponse.redirect(new URL('/favicon.ico', request.url));
  }
}

// Disable static optimization for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

