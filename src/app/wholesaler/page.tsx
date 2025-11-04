import dynamic from 'next/dynamic';
import React from 'react';
import { createMetadata } from "../layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/admin-dashboard", {
  title: "Admin Dashboard",
  description: "Manage your wholesaler operations and bookings",
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <p className="text-gray-600 dark:text-gray-300">Loading Dashboard...</p>
  </div>
);


const WholesalerDashboard = dynamic(
  () => import('./WholesalerDashboard'), 
  { 
    ssr: false, 
    loading: () => <LoadingFallback /> // 
  }
);

export default function WholesalerPage() {
  return <WholesalerDashboard />;
}