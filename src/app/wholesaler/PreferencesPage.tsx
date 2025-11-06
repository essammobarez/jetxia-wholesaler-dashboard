// Settings.tsx

"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { authenticator } from 'otplib';
import PasswordPrompt from "./PasswordPrompt"; // <-- The enhanced inline component
import { ShieldCheck, UserCircle, Mail, AlertTriangle, Copy, Check } from 'lucide-react';

// A reusable, restyled toggle switch component
const ToggleSwitch: React.FC<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
}> = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center gap-x-3">
      <span className={`text-sm font-medium transition-colors ${enabled ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`${enabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-zinc-900`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
);

// Skeleton loader for a single info line
const InfoSkeleton: React.FC = () => (
    <div className="flex justify-between items-center animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
    </div>
);


// Profile data type
interface ProfileData {
  username: string;
  email: string;
  googleAuth: boolean;
}

const Settings: React.FC = () => {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const getAuthToken = () => {
    return document.cookie
            .split('; ')
            .find(r => r.startsWith('authToken='))
            ?.split('=')[1] || localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      try {
        // Simulate network delay for skeleton loader visibility
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile data.');
        const result = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
          setIsTwoFactorEnabled(result.data.googleAuth);
        } else {
          throw new Error(result.message || 'Could not retrieve profile.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEnableTwoFactor = async (password: string) => {
    if (!profile?.email) {
      setApiError("User email not found. Cannot proceed.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      email: profile.email,
      password: password,
      type: "agency"
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/google-authenticator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate 2FA secret.");
      }

      let secret: string;

      // Use the secret from the backend if provided, otherwise generate a new one.
      if (result.success && result.data && result.data.secretKey) {
        secret = result.data.secretKey;
      } else {
        secret = authenticator.generateSecret();
      }

      const otpUri = authenticator.keyuri(profile.email, "YourApp: " + profile.email, secret);
      setSecretKey(secret);
      setOtpAuthUrl(otpUri);
      
      setShowPasswordPrompt(false);

    } catch (err: any) {
      setApiError(err.message);
      // If this fails, revert the toggle
      setIsTwoFactorEnabled(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
        setIsSubmitting(true);
        setApiError(null);
        const token = getAuthToken();

        if (!token) {
            setApiError("Authentication token not found.");
            setIsSubmitting(false);
            return reject(new Error("Authentication token not found."));
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ googleAuth: false }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to disable 2FA.");
            }

            setIsTwoFactorEnabled(false);
            if (profile) {
                setProfile({ ...profile, googleAuth: false });
            }
            resolve();
        } catch (err: any) {
            setApiError(err.message);
            setIsTwoFactorEnabled(true); // Revert toggle on failure
            reject(err);
        } finally {
            setIsSubmitting(false);
        }
    });

    toast.promise(promise, {
        loading: 'Disabling 2FA...',
        success: 'Two-Factor Authentication has been disabled.',
        error: (err) => `Error: ${err.message || 'Could not disable 2FA.'}`,
    });
  };

  const handleToggleChange = (newEnabledState: boolean) => {
    setIsTwoFactorEnabled(newEnabledState); // Visually update toggle immediately
    if (newEnabledState) {
      setApiError(null);
      setShowPasswordPrompt(true);
    } else {
      handleDisableTwoFactor();
    }
  };

  const handleCancelPasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setApiError(null);
    setIsTwoFactorEnabled(false); // Revert toggle if user cancels
  };

  const handleCopyKey = () => {
    if (secretKey) {
        navigator.clipboard.writeText(secretKey).then(() => {
            toast.success("Setup key copied to clipboard!");
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!secretKey) {
      toast.info("No pending security changes to save.");
      return;
    }

    const promise = new Promise<void>(async (resolve, reject) => {
        setIsSubmitting(true);
        setApiError(null);
        const token = getAuthToken();

        if (!token) {
            setApiError("Authentication token not found.");
            setIsSubmitting(false);
            return reject(new Error("Authentication token not found."));
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    googleAuth: true,
                    secretKey: secretKey,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to save 2FA settings.");
            }

            setIsTwoFactorEnabled(true);
            setSecretKey(null); // Clear the setup state
            setOtpAuthUrl(null);
            if (profile) {
                setProfile({ ...profile, googleAuth: true });
            }
            resolve();
        } catch (err: any) {
            setApiError(err.message);
            reject(err);
        } finally {
            setIsSubmitting(false);
        }
    });
    
    toast.promise(promise, {
        loading: 'Saving settings...',
        success: 'Two-Factor Authentication enabled successfully!',
        error: (err) => `Error: ${err.message || 'Could not save settings.'}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      <Toaster position="top-right" reverseOrder={false} />
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage your account information and security options.</p>
      </header>

      <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold leading-6 text-zinc-900 dark:text-zinc-100">User Information</h3>
          <div className="mt-4 space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
            {isLoading ? (
                <>
                    <InfoSkeleton />
                    <InfoSkeleton />
                </>
            ) : error ? (
                <p className="text-sm text-red-600 dark:text-red-500 flex items-center gap-x-2"><AlertTriangle size={16} /> Error: {error}</p>
            ) : profile ? (
                <>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-x-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"><UserCircle size={16} /> Username</span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{profile.username}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-x-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"><Mail size={16} /> Email Address</span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{profile.email}</span>
                    </div>
                </>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="flex items-center gap-x-2 text-lg font-semibold leading-6 text-zinc-900 dark:text-zinc-100"><ShieldCheck size={20} /> Two-Factor Authentication</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Enhance your account's security with an additional verification step.</p>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700/50 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium text-zinc-900 dark:text-zinc-100">Google Authenticator (2FA)</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Secure your account with a time-based one-time password.</p>
              </div>
              <ToggleSwitch
                enabled={isTwoFactorEnabled}
                setEnabled={handleToggleChange}
                label={isTwoFactorEnabled ? "Enabled" : "Disabled"}
              />
            </div>
          </div>

          {showPasswordPrompt && (
            <PasswordPrompt
              onConfirm={handleEnableTwoFactor}
              onCancel={handleCancelPasswordPrompt}
              isLoading={isSubmitting}
              apiError={apiError}
            />
          )}

          {otpAuthUrl && secretKey && (
            <div className="border-t border-zinc-200 dark:border-zinc-700/50 p-6 space-y-6">
                <div>
                    <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">Step 2: Scan & Save Your Key</h4>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Scan this QR code with your authenticator app, then click "Verify & Save" below.</p>
                </div>

                <div className="mt-4 flex justify-center p-4 bg-white rounded-lg" style={{ height: "auto", maxWidth: 180, width: "100%", margin: "20px auto" }}>
                    <QRCode value={otpAuthUrl} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} />
                </div>

                <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Or, enter this setup key manually:</p>
                    <div className="mt-2 flex items-center gap-x-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md">
                        <code className="flex-grow font-mono text-lg font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider break-all">
                            {secretKey}
                        </code>
                        <button type="button" onClick={handleCopyKey} className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            {copySuccess ? <Check className="text-green-500" size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-500 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                           <AlertTriangle className="h-5 w-5 text-orange-400 dark:text-orange-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                           <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                           ⚠️ Important: Save this key securely before continuing. You will need it to recover access if you lose your device.
                           </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-8">
          <button
            type="submit"
            disabled={!secretKey || isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-zinc-900 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (secretKey ? 'Verify & Save' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;