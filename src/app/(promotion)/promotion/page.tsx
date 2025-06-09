// app/promotion/page.tsx
import React, { Suspense } from 'react';
import ManagePromotionValue from './PromotionClient';

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
