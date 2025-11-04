// app/prebook/page.tsx

import React, { Suspense } from 'react'
import VerifyLoginPage from './VerifyLoginPage'
import { createMetadata } from "../layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/verify-login", {
  title: "Verify Login",
  description: "Verify your login credentials",
});

export default async function PrebookPage() {
  return (
    <Suspense fallback={<div className="p-6"></div>}>
      <VerifyLoginPage />
    </Suspense>
  )
}
