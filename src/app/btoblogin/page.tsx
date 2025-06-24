// File: ./Login.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';

import { InputField } from './loginInputField';
import { TravelGrowthSection } from './TravelGrowthSection';
import { ProductShowcaseSection } from './ProductShowcaseSection';
import { TripBookingSection } from './TripBookingSection';
import { EasyBusinessSection } from './EasyBusinessSection';
import { TravelersGallerySection } from './TravelersGallerySection';
import { HappyTravelersSection } from './HappyTravelersSection';
import { OurFiguresSection } from './OurFiguresSection';
import { NewsletterSection } from './NewsletterSection';
import { NewsAndPartnershipSection } from './NewsAndPartnershipSection';
import { PlatinumCollectionSection } from './PlatinumCollectionSection';
import Navbar from './Navbar';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [countdown, setCountdown] = useState(0); // Countdown in seconds for verification
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

  // 1) on mount, and 2) every second thereafter, check for `authToken` cookie
  useEffect(() => {
    const checkAndRedirect = () => {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='));
      if (match) {
        const authToken = match.split('=')[1];
        router.replace(`/wholesaler?token=${encodeURIComponent(authToken)}`);
        return true;
      }
      return false;
    };

    // immediate check
    if (checkAndRedirect()) return;

    // then poll every second
    const interval = setInterval(() => {
      if (checkAndRedirect()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  // Countdown effect for email verification
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else if (countdown === 0 && messageType === 'success' && localStorage.getItem('pendingToken')) {
      // If countdown reaches 0 and we were waiting for verification,
      // it means 5 minutes passed, and the user likely didn't verify in time.
      setMessage('Verification time expired. Please try logging in again to receive a new verification link.');
      setMessageType('error');
      localStorage.removeItem('pendingToken'); // Clear pending token as it might be expired on the backend
      toast.error('Verification time expired. Please try logging in again.');
      setLoading(false);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown, messageType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setCountdown(0); // Reset countdown on new login attempt

    try {
      const res = await fetch(`${API_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'wholesaler' }),
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

      // Regardless of token presence, if login is successful, inform user to verify and start countdown
      if (token) {
        localStorage.setItem('pendingToken', token);
      }
      
      setMessage('Please check your email to verify your account.');
      setMessageType('success');
      toast.success('Check your inbox for verification link.');
      setCountdown(5 * 60); // Start 5-minute (300 seconds) countdown for verification

      // REMOVED: router.push(`/verify-login?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      console.error('Login error:', err);
      setMessage(err.message || 'Login failed');
      setMessageType('error');
      toast.error(err.message || 'Login failed!');
      setCountdown(0); // Stop countdown on error
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                  <span className="text-blue-600">Booking Desk</span> helps travel agencies do their business better.
                </p>
                <p className="text-gray-600 mb-6 text-base max-w-lg">
                  Welcome to Booking Desk, your trusted partner in travel technology solutions. We empower travel agencies and tour operators with a powerful, all-in-one platform that offers seamless access to flights, hotels, transfers, and activities from top global suppliers. Designed for scalability and speed, Booking Desk helps you streamline operations, increase margins, and deliver exceptional service to your clients. Whether you’re growing your business or optimizing your current workflow, our technology is built to keep you ahead in the competitive travel market.  
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
                  <Image src="/images/bdesk.jpg" alt="Jetixia Logo Dark" width={150} height={50} priority />
                </div>

                {message && (
                  <div
                    className={`w-full p-2 rounded text-center mb-3 text-sm ${
                      messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                    <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || (messageType === 'success' && countdown > 0)}
                      className={`w-full mt-5 mb-10 sm:w-2/3 py-2 rounded-md text-white font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                        loading || (messageType === 'success' && countdown > 0)
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      }`}
                    >
                      {loading ? 'Logging in...' : (messageType === 'success' && countdown > 0 ? 'Verification Pending...' : 'LOGIN')}
                    </button>
                  </div>
                </form>

                
              </div>
            </div>
          </div>
        </div>

        {/* Other sections (commented out) */}
        {/* <PlatinumCollectionSection /> ... */}
      </div>
    </ThemeProvider>
  );
}