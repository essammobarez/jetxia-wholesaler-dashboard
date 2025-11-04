# Dynamic Metadata System - Implementation Summary

## 🎯 Overview

The dynamic metadata system has been successfully implemented across your entire Next.js application. This system automatically updates page titles, descriptions, and favicons based on the wholesaler's branding, detected by hostname.

---

## 📁 Files Created/Modified

### ✅ Core Files Created

1. **`src/utils/apiHandler.ts`** - API handler for fetching wholesaler branding
   - `getWholesalerBrandingServer()` - Server-side branding fetch
   - `getWholesalerBranding()` - Client-side branding fetch with caching

2. **`src/lib/metadataUtils.ts`** - Metadata generation utilities
   - `generateUnifiedMetadata()` - Server-side metadata generation
   - `updateClientMetadata()` - Client-side metadata updates
   - `formatPathToTitle()` - Converts pathname to readable title

3. **`src/components/BrandingMetaUpdater.tsx`** - Client component for dynamic updates
   - Automatically updates metadata on route changes
   - Handles client-side navigation

### ✅ Root Layout Updated

**`src/app/layout.tsx`** - Enhanced with metadata helpers
- `generateMetadata()` - Auto-detects pathname and generates metadata
- `generatePageMetadata(pathname)` - Manual metadata generation
- `createMetadata(pathname)` - Factory function for one-line usage
- Added `BrandingMetaUpdater` component
- Added `export const dynamic = 'force-dynamic'`

---

## 📄 Pages with Metadata Applied

### Server Components (Using `createMetadata` or `generateMetadata`)
✅ `/` (Home page)
✅ `/promotion` (Promotion page)
✅ `/verify-login` (Verify login page)
✅ `/wholesaler` (Wholesaler dashboard)
✅ `/markup` (Markup profile)
✅ `/wholesaler/flights-bs/package-requests` (Package requests)

### Client Components (Using `BrandingMetaUpdater`)
✅ `/auth` (Auth page)
✅ `/btoblogin` (B2B login page)
✅ `/add-provider` (Add provider page)
✅ `/wholesaler/mapping` (Mapping dashboard)
✅ `/wholesaler/mapping/hotels` (Hotels mapping)
✅ `/wholesaler/mapping/nationality` (Nationality mapping)
✅ `/wholesaler/mapping/cities` (Cities mapping)
✅ `/wholesaler/mapping/country` (Country mapping)
✅ `/wholesaler/flights-bs/offline-package` (Offline package)

---

## 🚀 How It Works

### 1. Server-Side Rendering (SSR)
- When a page loads, `generateMetadata()` is called
- Hostname is extracted from request headers
- Wholesaler branding is fetched from API based on hostname
- Metadata is generated with branding name and logo
- Page is rendered with proper SEO metadata

### 2. Client-Side Navigation
- `BrandingMetaUpdater` component monitors route changes
- When user navigates, metadata is updated dynamically
- Uses cached branding data from localStorage
- Updates document title, meta description, and favicon

### 3. Branding Data Flow
```
Hostname → API Request → Branding Data (name, logo) → Metadata Generation
                                    ↓
                          localStorage Cache (client-side)
```

---

## 💡 Usage Examples

### For New Server Component Pages

```typescript
// app/new-page/page.tsx
import { createMetadata } from "../layout";

// One-line metadata export
export const generateMetadata = createMetadata("/new-page", {
  title: "Custom Title",
  description: "Custom description",
});

export default function NewPage() {
  return <div>Content</div>;
}
```

### For Dynamic Pages with Params

```typescript
// app/hotel/[id]/page.tsx
import { generatePageMetadata } from "../../layout";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return await generatePageMetadata(`/hotel/${params.id}`, {
    title: `Hotel ${params.id}`,
  });
}

export default function HotelPage({ params }: { params: { id: string } }) {
  return <div>Hotel {params.id}</div>;
}
```

### For Client Components

Client components automatically get metadata updates via the `BrandingMetaUpdater` component in the root layout. No additional code needed!

---

## 🔧 Configuration

### API Endpoint
The system uses the UI settings API endpoint:
```
GET /api/v1/ui-settings/by-domain?domain={domain}
```

### Response Format
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Wholesaler and brand settings retrieved successfully",
  "data": {
    "id": "6862dede4adcea2148e77fb1",
    "name": "Booking Desk Travel",
    "logo": "https://iili.io/FmPPAiB.jpg",
    "wholesaler": {
      "wholesalerName": "Booking Desk Travel"
    },
    "brandSettings": {
      "wholesalerDomain": "https://admin.bdesktravel.com",
      "agencyDomain": "https://bdesktravel.com",
      "navLogo": "https://example.com/nav-logo.png",
      "brandLogo": "https://example.com/brand-logo.png",
      "metaName": "Booking Desk Travel",
      "brandName": "Booking Desk Travel"
    }
  }
}
```

### Response Field Usage
- **metaName / brandName**: Used for page titles (e.g., "Home | Booking Desk Travel")
- **brandLogo**: Used for favicon and metadata
- **navLogo**: Used for dashboard navigation/profile logo
- **logo** (fallback): Used if specific logos are not available

### Hostname Detection
- **Production**: Uses actual hostname (e.g., `admin.bdesktravel.com`)
- **Localhost**: Defaults to `jetixia.com` (fetches Jetixia branding from API)

---

## 📊 Benefits

1. ✅ **SEO-Friendly** - Server-side rendered metadata for search engines
2. ✅ **Dynamic Branding** - Changes based on hostname/wholesaler
3. ✅ **Type-Safe** - Full TypeScript support
4. ✅ **DRY Principle** - Reusable functions, no code duplication
5. ✅ **Flexible** - Supports static, dynamic, and client-side updates
6. ✅ **Auto Path Formatting** - `/hotels-list` → "Hotels List"
7. ✅ **Caching** - Client-side caching for performance
8. ✅ **Fallback Support** - Graceful fallback if API fails

---

## 🎨 Title Format

The system generates titles in the following format:
```
{Page Title} | {Wholesaler Name}
```

Examples:
- `Home | BDesk Travel`
- `Wholesaler Dashboard | BDesk Travel`
- `Hotels List | BDesk Travel`

---

## 🔄 Path to Title Conversion

| Path | Generated Title |
|------|----------------|
| `/` | Home |
| `/wholesaler` | Wholesaler |
| `/hotels-list` | Hotels List |
| `/hotel/123` | Hotel / 123 |
| `/manage-booking` | Manage Booking |

---

## 🐛 Troubleshooting

### Issue: Metadata not updating
**Solution**: Check that `export const dynamic = 'force-dynamic'` is in root layout

### Issue: Wrong branding showing
**Solution**: Clear localStorage cache:
```javascript
localStorage.removeItem('wholesalerName');
localStorage.removeItem('wholesalerLogo');
```

### Issue: Client pages not updating on navigation
**Solution**: Ensure `BrandingMetaUpdater` is in root layout's body

---

## 📚 Files Reference

```
src/
├── app/
│   ├── layout.tsx                    (Updated - Metadata helpers)
│   ├── page.tsx                      (Updated - Metadata applied)
│   ├── wholesaler/
│   │   └── page.tsx                  (Updated - Metadata applied)
│   ├── promotion/
│   │   └── page.tsx                  (Updated - Metadata applied)
│   └── ...
├── components/
│   └── BrandingMetaUpdater.tsx       (Created - Client updater)
├── lib/
│   └── metadataUtils.ts              (Created - Metadata utilities)
└── utils/
    └── apiHandler.ts                 (Created - API handler)
```

---

## ✨ Next Steps

To add metadata to additional pages:

1. **For server components**: Add `export const generateMetadata = createMetadata("/path")`
2. **For client components**: They're already covered by `BrandingMetaUpdater`
3. **For custom titles**: Pass options to `createMetadata("/path", { title: "Custom" })`

---

## 🎉 Completion Status

- ✅ API handler created
- ✅ Metadata utilities created
- ✅ Root layout updated
- ✅ BrandingMetaUpdater component created
- ✅ Metadata applied to all pages
- ✅ No linter errors
- ✅ Fully tested and working

**The dynamic metadata system is now fully operational across your entire application!**

