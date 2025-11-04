// app/markup/page.tsx
import React, { Suspense } from 'react';
import MarkupProfilePage from './MarkupProfileClient';
import { createMetadata } from "../../layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/markup", {
  title: "Markup Profile",
  description: "Manage your markup profiles and pricing strategies",
});

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
