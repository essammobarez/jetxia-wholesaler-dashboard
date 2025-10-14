/**
 * Utility functions for managing authentication tokens
 * Stores tokens in both localStorage (client-side) and cookies (for middleware)
 */

/**
 * Sets a cookie in the browser
 */
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === "undefined") return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Gets a cookie value by name
 */
const getCookie = (name: string): string => {
  if (typeof window === "undefined") return "";
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return "";
};

/**
 * Removes a cookie by name
 */
const removeCookie = (name: string) => {
  if (typeof window === "undefined") return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Save token to both localStorage and cookies
 * This ensures middleware can access the token via cookies
 */
export const setToLocalStorage = (key: string, token: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  
  // Store in localStorage (for client-side use)
  localStorage.setItem(key, token);
  
  // Also store in cookie (for middleware access)
  setCookie('authToken', token, 7);
  
  return token;
};

/**
 * Get token from localStorage or cookies as fallback
 */
export const getFromLocalStorage = (key: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }

  // First, try localStorage
  let token = localStorage.getItem(key);
  
  // If not in localStorage, check cookies
  if (!token) {
    token = getCookie('authToken');
    
    // If found in cookie, sync back to localStorage
    if (token) {
      localStorage.setItem(key, token);
    }
  }

  return token || "";
};

/**
 * Remove token from both localStorage and cookies
 */
export const removeFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return;
  
  // Remove from localStorage
  localStorage.removeItem(key);
  
  // Remove from cookies
  removeCookie('authToken');
};