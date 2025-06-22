// app/prebook/page.tsx


import React, { Suspense } from 'react'
import VerifyLoginPage from './VerifyLoginPage'


export default async function PrebookPage() {
  return (
    <Suspense fallback={<div className="p-6"></div>}>
      <VerifyLoginPage />
    </Suspense>
  )
}
