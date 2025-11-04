// app/promotion/page.tsx
import React, { Suspense } from 'react';
import ManagePromotionValue from './PromotionClient';
import { createMetadata } from "../layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/promotion", {
  title: "Promotion",
  description: "Manage your promotions and special offers",
});

export default function PromotionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-gray-500">Loading promotion…</div>
        </div>
      }
    >
      <ManagePromotionValue />
    </Suspense>
  );
}
