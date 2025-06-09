// app/markup/page.tsx
import React, { Suspense } from 'react';
import MarkupProfilePage from './MarkupProfileClient';

export default function MarkupPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading markup profile…
      </div>
    }>
      <MarkupProfilePage />
    </Suspense>
  );
}
