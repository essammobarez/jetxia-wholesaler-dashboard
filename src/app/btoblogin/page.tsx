'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';

import { InputField } from './loginInputField'; // Assuming this is a separate component

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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success'
  );
  const [countdown, setCountdown] = useState(0); // Countdown in seconds for verification
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

  // --- Initial Auth Check on Mount ---
  useEffect(() => {
    const checkAuthToken = () => {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='));
      if (match) {
        const authToken = match.split('=')[1];
        router.replace(`/wholesaler?token=${encodeURIComponent(authToken)}`);
        setRedirected(true); // Indicate that a redirect is in progress
        return true;
      }
      return false;
    };

    if (!checkAuthToken()) {
      setIsLoading(false); // Only show login form if no token found initially
    }

    // Cleanup for countdownIntervalRef, though it's managed by another effect now.
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [router]);

  // --- Polling for authToken cookie ---
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    const startPollingForAuthToken = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval); // Clear any existing interval
      }

      pollingInterval = setInterval(() => {
        const match = document.cookie
          .split('; ')
          .find((row) => row.startsWith('authToken='));

        if (match) {
          const authToken = match.split('=')[1];
          // Auth token found, navigate and stop polling
          router.replace(`/wholesaler?token=${encodeURIComponent(authToken)}`);
          setRedirected(true); // Signal that a redirect is happening
          if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null; // Ensure ref is nulled after clearing
          }
        }
      }, 2000); // Poll every 2 seconds
    };

    // Start polling if not already redirected and not in initial loading state
    if (!redirected && !isLoading) {
      startPollingForAuthToken();
    }

    // Cleanup interval when component unmounts or dependencies change leading to re-run
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };
  }, [redirected, isLoading, router]); // Re-run if redirected or initial loading state changes

  // Countdown effect for email verification (remains the same)
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else if (
      countdown === 0 &&
      messageType === 'success' &&
      localStorage.getItem('pendingToken') // Still check for pendingToken here for time expiry
    ) {
      setMessage(
        'Verification time expired. Please try logging in again to receive a new verification link.'
      );
      setMessageType('error');
      localStorage.removeItem('pendingToken');
      toast.error('Verification time expired. Please try logging in again.');
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown, messageType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setCountdown(0);

    // Convert email to lowercase before sending
    const lowercasedEmail = email.toLowerCase();

    try {
      const res = await fetch(`${API_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lowercasedEmail, password, type: 'wholesaler' }),
      });

      if (!res.ok) {
        const text = await res.text();
        let err = `Server ${res.status}`;
        try {
          const json = JSON.parse(text);
          err = json.message || err;
        } catch {
          err = `${err}: ${text.substring(0, 100)}...`;
        }
        throw new Error(err);
      }

      const ct = res.headers.get('Content-Type') || '';
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON but got: ${txt.substring(0, 200)}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Login failed');
      }

      const token = json.data?.token as string | undefined;

      if (token) {
        localStorage.setItem('pendingToken', token); // Still store pending token to manage UI state
      }

      setMessage('Please check your email to verify your account.');
      setMessageType('success');
      toast.success('Check your inbox for verification link.');
      setCountdown(5 * 60); // Start 5-minute countdown for email verification
    } catch (err: any) {
      console.error('Login error:', err);
      setMessage(err.message || 'Login failed');
      setMessageType('error');
      toast.error(err.message || 'Login failed!');
      setCountdown(0);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Render loading state first
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  // If loading is done AND we are redirected, show redirecting message
  if (redirected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
      </div>
    );
  }

  // If not loading and not redirected, show the login form
  return (
    <ThemeProvider theme={muiTheme}>
      {/* <Navbar /> */}
      <div className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col items-center">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="relative w-full max-w-7xl mt-12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Panel */}
            <div className="relative bg-white p-8 md:p-16 flex flex-col justify-center overflow-hidden">
              <div className="absolute -top-5 left-12 w-[320px] h-[90px]">
                <Image
                  src="/images/Vector.svg"
                  alt="Decorative dashed plane path"
                  width={320}
                  height={90}
                  priority
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3 leading-tight">
                  Welcome To{' '}
                  <span className="italic text-3xl md:text-4xl text-blue-600 font-extrabold">
                    Booking Desk,
                  </span>
                </h2>
                <p className="mb-2 text-blue-600 text-base">
                  <span className="text-blue-600">Booking Desk</span> helps
                  travel agencies do their business better.
                </p>
                <p className="text-gray-600 mb-6 text-base max-w-lg">
                  Welcome to Booking Desk, your trusted partner in travel
                  technology solutions. We empower travel agencies and tour
                  operators with a powerful, all-in-one platform that offers
                  seamless access to flights, hotels, transfers, and activities
                  from top global suppliers. Designed for scalability and speed,
                  Booking Desk helps you streamline operations, increase
                  margins, and deliver exceptional service to your clients.
                  Whether you’re growing your business or optimizing your
                  current workflow, our technology is built to keep you ahead in
                  the competitive travel market.
                </p>
                <button
                  type="button"
                  className="text-blue-600 border border-blue-600 hover:bg-blue-100 font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                >
                  Register For Free
                </button>
              </div>
            </div>

            {/* Right Login Panel */}
            <div className="relative flex items-center justify-center  md:justify-end md:pr-12 overflow-hidden">
              <div className="absolute inset-0 md:rounded-bl-[5rem] w-full overflow-hidden">
                <Image
                  src="/images/bg.png"
                  alt="Login Background"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <div className="absolute bg-black/10" />
              </div>
              <div className="relative bg-white bg-opacity-90 px-4 rounded-xl shadow-lg p-2 max-w-md w-full mx-2 md:mx-0">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/images/bdesk.jpg"
                    alt="Jetixia Logo Dark"
                    width={150}
                    height={50}
                    priority
                  />
                </div>

                {message && (
                  <div
                    className={`w-full p-2 rounded text-center mb-3 text-sm ${
                      messageType === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {message}
                    {messageType === 'success' && countdown > 0 && (
                      <div className="mt-1 font-bold">
                        Waiting for verification: {formatTime(countdown)}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField
                    label="User Name"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john.doe@example.com"
                  />
                  <InputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showPassword={showPassword}
                    toggleShowPassword={() => setShowPassword((prev) => !prev)}
                    required
                    placeholder="••••••••"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-gray-600 select-none">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      Remember me
                    </label>
                    <a
                      href="/forgot-password"
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={messageType === 'success' && countdown > 0}
                      className={`w-full mt-5 mb-10 sm:w-2/3 py-2 rounded-md text-white font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                        messageType === 'success' && countdown > 0
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      }`}
                    >
                      {messageType === 'success' && countdown > 0
                        ? 'Verification Pending...'
                        : 'LOGIN'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
