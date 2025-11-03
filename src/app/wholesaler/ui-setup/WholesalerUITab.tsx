'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCw } from 'lucide-react';

export default function WholesalerUITab() {
  const [formData, setFormData] = useState({
    title: 'Wholesaler Dashboard',
    loginTitle: 'Wholesaler Login',
    loginSubtitle: 'Access your wholesaler management portal',
    logo: null as File | null,
    favicon: null as File | null,
    logoPreview: '',
    faviconPreview: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type]: file,
          [`${type}Preview`]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Wholesaler UI settings saved successfully!');
  };

  const handleReset = () => {
    setFormData({
      title: 'Wholesaler Dashboard',
      loginTitle: 'Wholesaler Login',
      loginSubtitle: 'Access your wholesaler management portal',
      logo: null,
      favicon: null,
      logoPreview: '',
      faviconPreview: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wholesaler UI Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customize the branding and appearance for wholesaler dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="btn-modern bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-gradient px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Wholesaler Logo
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {formData.logoPreview ? (
                <div className="space-y-4">
                  <img
                    src={formData.logoPreview}
                    alt="Logo preview"
                    className="max-h-32 mx-auto object-contain"
                  />
                  <button
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="btn-modern bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Logo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Upload Wholesaler Logo
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG or SVG (max. 2MB)
                    </p>
                  </div>
                  <button
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="btn-modern bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </button>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended size: 200x60px for optimal display
            </p>
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Favicon
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
              {formData.faviconPreview ? (
                <div className="space-y-4">
                  <img
                    src={formData.faviconPreview}
                    alt="Favicon preview"
                    className="w-16 h-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => document.getElementById('favicon-upload')?.click()}
                    className="btn-modern bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Favicon
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Upload Favicon
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ICO, PNG (32x32px)
                    </p>
                  </div>
                  <button
                    onClick={() => document.getElementById('favicon-upload')?.click()}
                    className="btn-modern bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </button>
                </div>
              )}
              <input
                id="favicon-upload"
                type="file"
                accept="image/x-icon,image/png"
                onChange={(e) => handleFileChange(e, 'favicon')}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended size: 32x32px or 64x64px
            </p>
          </div>
        </div>
      </div>

      {/* Text Settings */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Text & Title Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Portal Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Wholesaler Dashboard"
              className="input-modern w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will appear in the browser tab
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Login Page Title
            </label>
            <input
              type="text"
              name="loginTitle"
              value={formData.loginTitle}
              onChange={handleInputChange}
              placeholder="e.g., Wholesaler Login"
              className="input-modern w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Main heading on login page
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Login Subtitle
            </label>
            <textarea
              name="loginSubtitle"
              value={formData.loginSubtitle}
              onChange={handleInputChange}
              placeholder="Welcome message for login page"
              rows={3}
              className="input-modern w-full resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Subtitle or description text below the login title
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

