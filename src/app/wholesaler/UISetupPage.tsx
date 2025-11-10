'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle, Edit, Eye, Plus, Upload, X } from 'lucide-react';

interface UISettings {
  wholesalerDomain: string;
  wholesalerSiteContent: string;
  agencyDomain: string;
  navLogo: string;
  brandLogo: string;
  loadingLogo: string;
  landingBanner: string;
  metaName: string;
  brandName: string;
}

export default function UISetupPage() {
  const [formData, setFormData] = useState<UISettings>({
    wholesalerDomain: '',
    wholesalerSiteContent: '',
    agencyDomain: '',
    navLogo: '',
    brandLogo: '',
    loadingLogo: '',
    landingBanner: '',
    metaName: '',
    brandName: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [extractedDomain, setExtractedDomain] = useState<string>('');
  const [uiSettingEnabled, setUiSettingEnabled] = useState(false);

  // Extract domain from current URL
  const extractDomain = (): string => {
    if (typeof window === 'undefined') return 'localhost:3001';

    const hostname = window.location.hostname;

    // If localhost, return default
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'localhost:3001';
    }

    // Extract domain using regex
    // Matches patterns like: admin.bdesktravel.com, www.bdesktravel.com, bdesktravel.com
    const domainMatch = hostname.match(/(?:^|\.)([\w-]+\.\w+)$/);
    if (domainMatch && domainMatch[1]) {
      return domainMatch[1];
    }

    // Fallback: return the whole hostname
    return hostname;
  };

  // Initialize domain on mount
  useEffect(() => {
    const domain = extractDomain();
    setExtractedDomain(domain);
  }, []);

  const fetchUISettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1] || localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }

      // Extract only the domain name without extension for API query
      const domainName = extractedDomain.split('.')[0]; // e.g., 'bdesktravel' from 'bdesktravel.com'

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ui-settings/by-domain?domain=${domainName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // console.log('UI Settings API Response:', result);
        if (result.success && result.data && result.data.brandSettings) {
          // Extract data from nested brandSettings object
          const brandSettings = result.data.brandSettings;
          // console.log('Extracted brandSettings:', brandSettings);
          // console.log('Wholesaler Site Content:', brandSettings.wholesalerSiteContent);
          
          const newFormData = {
            wholesalerDomain: brandSettings.wholesalerDomain || '',
            wholesalerSiteContent: brandSettings.wholesalerSiteContent || '',
            agencyDomain: brandSettings.agencyDomain || '',
            navLogo: brandSettings.navLogo || '',
            brandLogo: brandSettings.brandLogo || '',
            loadingLogo: brandSettings.loadingLogo || '',
            landingBanner: brandSettings.landingBanner || '',
            metaName: brandSettings.metaName || '',
            brandName: brandSettings.brandName || '',
          };
          
          setFormData(newFormData);
          setIsExisting(true);
          setIsEditMode(false); // Start in view mode
        }
      } else if (response.status === 404) {
        // No existing settings found
        // If uisetting is false, enable edit mode for creation
        console.log('UI Settings not found (404), uiSettingEnabled:', uiSettingEnabled);
        setIsExisting(false);
        setIsEditMode(!uiSettingEnabled); // Start in edit mode only if UI settings not enabled
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to fetch UI settings');
      }
    } catch (err) {
      console.error('Error fetching UI settings:', err);
      setError('Failed to load UI settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile and UI settings
  useEffect(() => {
    const fetchProfileAndSettings = async () => {
      if (!extractedDomain) return;

      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('authToken='))
          ?.split('=')[1] || localStorage.getItem('authToken');

        if (!token) {
          setError('Authentication token not found');
          setIsLoading(false);
          return;
        }

        // First, fetch profile to check uisetting flag
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          if (profileResult.success && profileResult.data) {
            const uiSettingFlag = profileResult.data.uisetting || false;
            setUiSettingEnabled(uiSettingFlag);
            // console.log('UI Setting Enabled:', uiSettingFlag);
          }
        }

        // Then fetch UI settings
        await fetchUISettings();
      } catch (err) {
        console.error('Error fetching profile:', err);
        setIsLoading(false);
      }
    };

    fetchProfileAndSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedDomain]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'navLogo' | 'brandLogo' | 'loadingLogo' | 'landingBanner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        [fieldName]: base64String
      }));
      setError(null);
      setSuccess(null);
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (fieldName: 'navLogo' | 'brandLogo' | 'loadingLogo' | 'landingBanner') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1] || localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token not found');
        setIsSaving(false);
        return;
      }

      // Use POST for creating (uisetting: false), PATCH for updating (uisetting: true)
      const method = uiSettingEnabled ? 'PATCH' : 'POST';
      console.log('Saving UI Settings with method:', method, 'uiSettingEnabled:', uiSettingEnabled);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ui-settings`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(uiSettingEnabled ? 'UI settings updated successfully!' : 'UI settings created successfully!');
        setIsExisting(true);
        setIsEditMode(false); // Switch back to view mode
        setUiSettingEnabled(true); // Update the flag after successful creation/update
        
        // Refresh the data
        setTimeout(() => {
          fetchUISettings();
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.message || 'Failed to save UI settings');
      }
    } catch (err) {
      console.error('Error saving UI settings:', err);
      setError('Failed to save UI settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setError(null);
    setSuccess(null);
    // Reload data to discard changes
    fetchUISettings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading UI settings...</p>
        </div>
      </div>
    );
  }

  // Render View Mode
  const renderViewMode = () => {
    console.log('Rendering View Mode - formData:', formData);
    return (
    <div className="space-y-6">
      {/* Domain Information */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Domain Configuration
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Wholesaler Domain
            </label>
            <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
              {formData.wholesalerDomain || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Agency Domain
            </label>
            <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
              {formData.agencyDomain || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Branding Information */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Branding Configuration
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Brand Name
            </label>
            <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
              {formData.brandName || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Meta Name
            </label>
            <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
              {formData.metaName || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Logo Information */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Logo Configuration
        </h3>
        
        {/* Three column layout for small logos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Nav Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Navigation Logo
            </label>
            {formData.navLogo ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
                  <img
                    src={formData.navLogo}
                    alt="Nav logo"
                    className="max-h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-8 rounded-lg italic text-center">
                Not set
              </div>
            )}
          </div>

          {/* Brand Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Brand Logo
            </label>
            {formData.brandLogo ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
                  <img
                    src={formData.brandLogo}
                    alt="Brand logo"
                    className="max-h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-8 rounded-lg italic text-center">
                Not set
              </div>
            )}
          </div>

          {/* Loading Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Loading Logo
            </label>
            {formData.loadingLogo ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
                  <img
                    src={formData.loadingLogo}
                    alt="Loading logo"
                    className="max-h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-8 rounded-lg italic text-center">
                Not set
              </div>
            )}
          </div>
        </div>

        {/* Full width layout for landing banner */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Landing Banner
          </label>
          {formData.landingBanner ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center min-h-[200px]">
                <img
                  src={formData.landingBanner}
                  alt="Landing banner"
                  className="max-h-[180px] w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-12 rounded-lg italic text-center">
              No banner set
            </div>
          )}
        </div>
      </div>

      {/* Site Content */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Wholesaler Site Content
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Hero Content
          </label>
          {formData.wholesalerSiteContent && formData.wholesalerSiteContent.trim() !== '' ? (
            <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg font-mono whitespace-pre-wrap break-words">
              {formData.wholesalerSiteContent}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg italic">
              No content set
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  // Render Edit Mode
  const renderEditMode = () => (
    <div className="space-y-6 animate-fade-scale">
      {/* Domain Settings */}
      <div className="card-modern p-6 border-l-4 border-l-blue-500 border-t-0 border-r-0 border-b-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Domain Configuration
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure your wholesaler and agency domain URLs
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Wholesaler Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="wholesalerDomain"
              value={formData.wholesalerDomain}
              onChange={handleInputChange}
              placeholder="https://admin.example.com"
              className="input-modern w-full px-4 py-3 text-sm border border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your wholesaler dashboard domain URL
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Agency Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="agencyDomain"
              value={formData.agencyDomain}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="input-modern w-full px-4 py-3 text-sm border border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your agency portal domain URL
            </p>
          </div>
        </div>
      </div>

      {/* Branding Settings */}
      <div className="card-modern p-6 border-l-4 border-l-purple-500 border-t-0 border-r-0 border-b-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Branding Configuration
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set your brand name and meta information
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              placeholder="e.g., Booking Desk Travel"
              className="input-modern w-full px-4 py-3 text-sm border border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your company or brand name
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Meta Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="metaName"
              value={formData.metaName}
              onChange={handleInputChange}
              placeholder="e.g., Booking Desk Travel"
              className="input-modern w-full px-4 py-3 text-sm border border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Used for SEO and browser tab title
            </p>
          </div>
        </div>
      </div>

      {/* Logo Settings */}
      <div className="card-modern p-6 border-l-4 border-l-orange-500 border-t-0 border-r-0 border-b-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Logo Configuration
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload your logo images
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nav Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Navigation Logo <span className="text-red-500">*</span>
            </label>
            
            {!formData.navLogo ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageUpload(e, 'navLogo')}
                  className="hidden"
                  id="navLogoInput"
                />
                <label
                  htmlFor="navLogoInput"
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRemoveImage('navLogo')}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg flex items-center justify-center min-h-[80px]">
                  <img
                    src={formData.navLogo}
                    alt="Nav logo preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Used in navigation bar
            </p>
          </div>

          {/* Brand Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand Logo <span className="text-red-500">*</span>
            </label>
            
            {!formData.brandLogo ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageUpload(e, 'brandLogo')}
                  className="hidden"
                  id="brandLogoInput"
                />
                <label
                  htmlFor="brandLogoInput"
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRemoveImage('brandLogo')}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg flex items-center justify-center min-h-[80px]">
                  <img
                    src={formData.brandLogo}
                    alt="Brand logo preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Primary brand logo (used as favicon)
            </p>
          </div>

          {/* Loading Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading Logo <span className="text-red-500">*</span>
            </label>
            
            {!formData.loadingLogo ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageUpload(e, 'loadingLogo')}
                  className="hidden"
                  id="loadingLogoInput"
                />
                <label
                  htmlFor="loadingLogoInput"
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRemoveImage('loadingLogo')}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg flex items-center justify-center min-h-[80px]">
                  <img
                    src={formData.loadingLogo}
                    alt="Loading logo preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Displayed during loading screens
            </p>
          </div>

          {/* Landing Banner */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Landing Banner <span className="text-red-500">*</span>
            </label>
            
            {!formData.landingBanner ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageUpload(e, 'landingBanner')}
                  className="hidden"
                  id="landingBannerInput"
                />
                <label
                  htmlFor="landingBannerInput"
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRemoveImage('landingBanner')}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg flex items-center justify-center min-h-[80px]">
                  <img
                    src={formData.landingBanner}
                    alt="Landing banner preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Hero banner for landing page
            </p>
          </div>
        </div>
      </div>

      {/* Site Content */}
      <div className="card-modern p-6 border-l-4 border-l-green-500 border-t-0 border-r-0 border-b-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Wholesaler Site Content
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Custom HTML content for your wholesaler site
            </p>
          </div>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
            Optional
          </span>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hero Content
          </label>
          <textarea
            name="wholesalerSiteContent"
            value={formData.wholesalerSiteContent}
            onChange={handleInputChange}
            placeholder='Welcome to Booking Desk Travel'
            rows={6}
            className="input-modern w-full resize-none font-mono text-sm px-4 py-3 border border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Custom HTML content for wholesaler site (optional)
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="card-modern p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Important Guidelines
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>All fields marked with <span className="text-red-500 font-semibold">*</span> are required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Make sure all URLs start with https://</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Logo images should be in JPG, PNG, GIF, or WebP format (Max 5MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Uploaded images are automatically converted to base64 format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Changes will take effect immediately after saving</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-modern p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                UI Settings
              </h2>
              {isEditMode && (
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  Edit Mode
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditMode 
                ? 'Configure your wholesaler and agency domain settings, logos, and branding'
                : 'View your current UI configuration'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                {isExisting && (
                  <button
                    onClick={handleCancelEdit}
                    className="btn-modern bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-gradient px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {uiSettingEnabled ? 'Update Settings' : 'Create Settings'}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="btn-gradient px-6 py-3 shadow-lg flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="card-modern p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="card-modern p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        </div>
      )}

      {/* Conditional Rendering: View or Edit Mode */}
      {isEditMode ? renderEditMode() : renderViewMode()}
    </div>
  );
}

