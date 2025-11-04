export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
};

// Note: Use NEXT_PUBLIC_BACKEND_URL environment variable
// Default: http://localhost:5000/api/v1
