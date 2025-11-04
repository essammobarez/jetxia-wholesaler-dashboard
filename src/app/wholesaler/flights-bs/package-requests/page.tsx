import PackageRequestsModule from './PackageRequestsModule';
import { createMetadata } from "../../../layout";

// Generate dynamic metadata based on wholesaler branding
export const generateMetadata = createMetadata("/wholesaler/flights-bs/package-requests", {
  title: "Package Requests",
  description: "Manage package booking requests",
});

export default function PackageRequestsPage() {
  return <PackageRequestsModule />;
}

