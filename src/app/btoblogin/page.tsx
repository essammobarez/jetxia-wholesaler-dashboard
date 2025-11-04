'use client';

import React, { useState, useEffect, FC, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import { useAppSelector } from '@/hooks/useRedux';

// 2FA Imports
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Note: Metadata is handled by BrandingMetaUpdater component in root layout for client pages

// --- MUI Theme (Unchanged) ---
const muiTheme = createTheme({
  palette: {
    primary: { main: '#007bff' },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#4B5563',
            '&.Mui-focused': { color: '#007bff' },
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem',
            '& fieldset': { borderColor: '#E5E7EB' },
            '&:hover fieldset': { borderColor: '#D1D5DB' },
            '&.Mui-focused fieldset': {
              borderColor: '#007bff',
              borderWidth: '1px',
            },
            '& input': {
              color: '#1F2937',
              padding: '12px 14px',
            },
          },
        },
      },
    },
  },
});

// --- InputField Component (Unchanged) ---
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
}

const InputField: FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
  showPassword,
  toggleShowPassword,
}) => (
  <div>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      {label === 'Password' && (
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l3.41-3.41a1.012 1.012 0 011.415 0l3.415 3.415a1.012 1.012 0 010 1.415l-3.415 3.415a1.012 1.012 0 01-1.415 0l-3.41-3.41a1.012 1.012 0 010-.638z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      )}
    </div>
  </div>
);

// --- OTP Input Component (For Google Auth - Numeric only) ---
interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

const OtpInput: FC<OtpInputProps> = ({ length, value, onChange }) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const enteredValue = element.value.replace(/[^0-9]/g, '');
    const newOtp = [...value.split('')];
    newOtp[index] = enteredValue.slice(-1);
    onChange(newOtp.join(''));
    if (enteredValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (pasteData.length === length) {
      onChange(pasteData);
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 my-3" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          className="w-10 h-12 text-center text-2xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      ))}
    </div>
  );
};

// --- Email OTP Input Component (Alphanumeric) ---
interface EmailOtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

const EmailOtpInput: FC<EmailOtpInputProps> = ({ length, value, onChange }) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const enteredValue = element.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const newOtp = [...value.split('')];
    newOtp[index] = enteredValue.slice(-1);
    onChange(newOtp.join(''));
    if (enteredValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (pasteData.length === length) {
      onChange(pasteData);
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 my-3" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          className="w-10 h-12 text-center text-2xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      ))}
    </div>
  );
};


// --- Main Login Component (UPDATED) ---
export default function Login() {
  const router = useRouter();

  // --- State Management (UPDATED) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'google'>('email');
  type AuthStep = 'credentials' | 'email-verify-pending' | 'email-verify-otp' | '2fa-setup' | '2fa-verify';
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [wholesalerLogo, setWholesalerLogo] = useState<string | null>(null);
  const [wholesalerName, setWholesalerName] = useState<string>('Booking Desk');
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

  // --- Effects (UPDATED) ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === 'email-verify-pending' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  useEffect(() => {
    if (authStep !== 'email-verify-pending') return;
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'pendingToken' && event.newValue === null) {
        toast.success('Account verified successfully! Redirecting to dashboard...');
        router.push('/wholesaler');
        localStorage.removeItem('pendingToken');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authStep, router]);

  // --- Check if user is already logged in ---
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (isAuthenticated || authToken) {
      router.push('/wholesaler');
    }
  }, [isAuthenticated, router]);

  // --- Effect Hook to fetch wholesaler data (logo and name) and save to localStorage ---
  useEffect(() => {
    const fetchWholesalerData = async () => {
      try {
        const website = "http://www.bdesktravel.com";
        const res = await fetch(`${API_URL}wholesaler/getbywebsite/?website=${website}`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          if (json.data.logo) {
            setWholesalerLogo(json.data.logo);
            localStorage.setItem('wholesalerLogo', json.data.logo); // Save logo to local storage
          }
          if (json.data.name) {
            setWholesalerName(json.data.name);
            localStorage.setItem('wholesalerName', json.data.name); // Save name to local storage
          }
        }
      } catch (err) {
        console.error('Failed to fetch wholesaler data:', err);
      } finally {
        setIsLoadingLogo(false);
      }
    };
    fetchWholesalerData();
  }, [API_URL]);

  // --- Helpers & Handlers (UPDATED) ---
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const lowercasedEmail = email.toLowerCase();

    // Logic for Email Verification
    if (verificationMethod === 'email') {
      try {
        const res = await fetch(`${API_URL}auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: lowercasedEmail, password, type: 'wholesaler' }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Invalid credentials or server error.');
        }
        toast.success('Login successful! A verification link has been sent.');
        localStorage.setItem('pendingToken', 'true');
        setAuthStep('email-verify-pending');
        setCountdown(300);
      } catch (err: any) {
        setMessage(err.message);
        setMessageType('error');
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Logic for Google Authenticator
    if (verificationMethod === 'google') {
      try {
        const res = await fetch(`${API_URL}auth/google-authenticator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: lowercasedEmail, password, type: 'wholesaler' }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Invalid credentials or server error.');
        }

        // Save accessToken as authToken immediately after successful credential check
        if (json.data?.accessToken) {
          const authToken = json.data.accessToken;
          const expires = new Date(Date.now() + 86400e3).toUTCString(); // 24 hours
          document.cookie = `authToken=${authToken}; expires=${expires}; path=/; SameSite=Lax; Secure`;
          localStorage.setItem('authToken', authToken);
        } else {
          throw new Error('Authentication failed: No access token received.');
        }

        if (json.data?.secretKey) {
          toast.success('Credentials verified. Please enter your 2FA code.');
          setSetupSecret(json.data.secretKey);
          setAuthStep('2fa-verify');
        } else {
          toast.success('Credentials verified. Please set up your 2FA.');
          const newSecret = authenticator.generateSecret();
          const otpAuthUrl = authenticator.keyuri(lowercasedEmail, wholesalerName, newSecret);
          const qrUrl = await QRCode.toDataURL(otpAuthUrl);
          setSetupSecret(newSecret);
          setQrCodeDataUrl(qrUrl);
          setAuthStep('2fa-setup');
        }
      } catch (err: any) {
        setMessage(err.message);
        setMessageType('error');
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!setupSecret) {
      toast.error('An error occurred. Please try logging in again.');
      setAuthStep('credentials');
      setIsLoading(false);
      return;
    }

    try {
      if (twoFactorToken.length !== 6) {
        throw new Error('Please enter a valid 6-digit code.');
      }

      const isValid = authenticator.verify({ token: twoFactorToken, secret: setupSecret });

      if (!isValid) {
        throw new Error('Invalid 2FA code. Please try again.');
      }

      if (authStep === '2fa-setup') {
        const saveRes = await fetch(`${API_URL}auth/save-secret-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password: password,
            secretKey: setupSecret,
          }),
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.success) {
          throw new Error(saveData.message || 'Failed to save 2FA setup.');
        }

        toast.success('2FA set up successfully! Redirecting...');
        router.push('/wholesaler');

      } else if (authStep === '2fa-verify') {
        toast.success('Verification successful! Redirecting...');
        router.push('/wholesaler');
      }

    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
      toast.error(err.message);
      setTwoFactorToken('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      if (emailOtp.length !== 6) {
        throw new Error('Please enter a valid 6-character code.');
      }

      const res = await fetch(`${API_URL}auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          code: emailOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP. Please try again.');
      }

      const accessToken = data.data?.accessToken || data.data?.token;
      if (accessToken) {
        const expires = new Date(Date.now() + 86400e3).toUTCString();
        document.cookie = `authToken=${accessToken}; expires=${expires}; path=/; SameSite=Lax; Secure`;
        localStorage.setItem('authToken', accessToken);
      }

      toast.success('Verification successful! Redirecting...');
      router.push('/wholesaler');

    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
      toast.error(err.message);
      setEmailOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render logic for different authentication steps ---
  const renderAuthStep = () => {
    const buttonClassName = `w-full py-3 rounded-lg text-white font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
      isLoading
        ? 'bg-blue-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
    }`;

    switch (authStep) {
      case 'credentials':
        return (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="User Name"
            />
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword((prev) => !prev)}
              required
              placeholder="Password"
            />

            <div className="pt-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('email')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200  ${
                    verificationMethod === 'email'
                      ? 'bg-blue-600 text-white ring-blue-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Email Verify
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod('google')}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200  ${
                    verificationMethod === 'google'
                      ? 'bg-blue-600 text-white ring-blue-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  G-Authenticator
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 select-none">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Remember me
              </label>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className={buttonClassName}>
                {isLoading ? 'Processing...' : 'Login'}
              </button>
            </div>
          </form>
        );

      case '2fa-setup':
        return (
          <form onSubmit={handle2FASubmit} className="text-center">
            <h2 className="mb-1 text-xl font-bold text-gray-800">Set Up 2-Factor Authentication</h2>
            <p className="mb-2 text-sm text-gray-600">Scan QR or enter code manually.</p>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} alt="2FA QR Code" width={160} height={160} className="mx-auto my-2 rounded-lg border p-1 bg-white" />}

            <p className="text-xs text-gray-500 mt-3">Manual Setup Code:</p>
            <div className="my-1 bg-gray-100 p-2 rounded-md">
              <p className="text-base font-mono tracking-wider text-gray-800 break-all select-all">
                {setupSecret}
              </p>
            </div>

            <p className="text-sm font-medium text-gray-700 mt-3">Enter Verification Code</p>
            <OtpInput length={6} value={twoFactorToken} onChange={setTwoFactorToken} />
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className={buttonClassName}>
                {isLoading ? 'Verifying...' : 'Verify & Complete'}
              </button>
            </div>
          </form>
        );

      case '2fa-verify':
        return (
          <form onSubmit={handle2FASubmit} className="text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800">Enter Verification Code</h2>
            <p className="mb-3 text-sm text-gray-600">Open your authenticator app and enter the code for {email}.</p>
            <OtpInput length={6} value={twoFactorToken} onChange={setTwoFactorToken} />
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className={buttonClassName}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        );

      case 'email-verify-pending':
        return (
          <form onSubmit={handleEmailOtpSubmit} className="text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800">Verify your email address</h2>
            <p className="mb-3 text-sm text-gray-600">
              An OTP has been sent to <span className="font-bold text-green-600">{email.toLowerCase()}</span>
            </p>
            <p className="text-sm font-medium text-gray-700 mb-2">Enter the 6-character code</p>
            <EmailOtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
            {countdown > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                <span>Expires in: {formatTime(countdown)}</span>
              </div>
            )}
            <div className="pt-2">
              <button type="submit" disabled={isLoading || emailOtp.length !== 6} className={buttonClassName}>
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (isLoadingLogo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="font-sans antialiased  min-h-screen flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white grid grid-cols-1 md:grid-cols-2 overflow-hidden">

            {/* Left Panel (UPDATED) */}
            <div className="relative p-8 md:p-12 flex flex-col justify-center">
              <div className="absolute -top-5 left-12 w-[320px] h-[90px]">
                <Image src="/images/Vector.svg" alt="Decorative dashed plane path" width={320} height={90} priority />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-semibold text-gray-800 mb-3 leading-tight">
                  Welcome To <span className="text-blue-600 font-bold">{wholesalerName},</span>
                </h2>
                <p className="mb-4 text-blue-600">{wholesalerName} helps travel agencies do their business better.</p>
                <p className="text-gray-600 text-sm mb-8 max-w-md">
                  Welcome to {wholesalerName}, your trusted partner in travel technology solutions. We empower travel agencies and tour operators with a powerful, all-in-one platform that offers seamless access to flights, hotels, transfers, and activities from top global suppliers. Designed for scalability and speed, {wholesalerName} helps you streamline operations, increase margins, and deliver exceptional service to your clients. Whether you’re growing your business or optimizing your current workflow, our technology is built to keep you ahead in the competitive travel market.
                </p>
              </div>
            </div>

            {/* Right Login Panel (UPDATED) */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 w-full h-full">
                <Image src="/images/bg.png" alt="Login Background" fill style={{ objectFit: 'cover' }} priority />
              </div>

              <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-sm m-4">
                {authStep === 'credentials' && (
                  <div className="flex justify-center mb-0">
                    {wholesalerLogo ? (
                      <Image src={wholesalerLogo} alt="Wholesaler Logo" width={160} height={55} priority />
                    ) : (
                      null
                    )}
                  </div>
                )}

                {message && (
                  <div className={`w-full p-2 rounded text-center mb-4 text-sm ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                  </div>
                )}

                {renderAuthStep()}
              </div>

            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}