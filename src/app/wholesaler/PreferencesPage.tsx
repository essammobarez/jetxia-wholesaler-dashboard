import React, { useState } from 'react';

// --- SVG Icon Components ---

const MailIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056a12.02 12.02 0 009-2.056c0-1.87-.333-3.664-.94-5.334z" />
  </svg>
);

// --- Reusable UI Components ---

const ToggleSwitch = ({ id, checked, onChange, disabled = false }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};

const SecuritySettingItem = ({ icon, title, description, id, checked, onChange, disabled }) => {
  return (
    <li className="p-6 flex items-start sm:items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            {description}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-6">
           <ToggleSwitch id={id} checked={checked} onChange={onChange} disabled={disabled} />
        </div>
      </div>
    </li>
  );
};


// --- Main Settings Component ---

export default function App() {
  // State for security settings using a single object
  const [securitySettings, setSecuritySettings] = useState({
    email: true,
    google: false,
  });

  // This handler ensures that only one authentication method is active at a time.
  const handleToggle = (method) => {
    if (method === 'email') {
      // If email is already on, do nothing. Otherwise, turn email on and google off.
      if (!securitySettings.email) {
        setSecuritySettings({ email: true, google: false });
      }
    } else if (method === 'google') {
      // If google is already on, do nothing. Otherwise, turn google on and email off.
      if (!securitySettings.google) {
        setSecuritySettings({ email: false, google: true });
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage two-factor authentication (2FA) methods to protect your account.
          </p>
        </header>

        {/* Security Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Authentication Method</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select one primary method for authentication.</p>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <SecuritySettingItem
              icon={<MailIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
              title="Email Verification"
              description="Receive a verification code via email for sensitive actions and logins."
              id="email-verification"
              checked={securitySettings.email}
              onChange={() => handleToggle('email')}
            />
            <SecuritySettingItem
              icon={<ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
              title="Google Authenticator (2FA)"
              description="Use a time-based one-time password (TOTP) from an authenticator app."
              id="google-authenticator"
              checked={securitySettings.google}
              onChange={() => handleToggle('google')}
            />
          </ul>
        </div>
      </div>
    </div>
  );
}
