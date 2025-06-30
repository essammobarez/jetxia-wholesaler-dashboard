// Code 2: VerifyLoginPage Component
'use client';

// Opt out of prerendering to avoid build errors in a client-only page
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyLoginPage: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // This token is the actual authentication token
  const router = useRouter();

  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'no-token'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

  // Countdown timer for the verification link itself
  useEffect(() => {
    if (status !== 'pending') return;
    if (timeLeft <= 0) {
      setStatus('error');
      toast.error('Verification link expired. Please request a new one.', { id: 'expired-toast' });
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  // Verify on mount
  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      toast.error(
        "It looks like there's no token in the URL. Please use the complete login link.",
        { id: 'no-token-toast', duration: 5000 }
      );
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_URL}auth/verify-login?token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const json = await res.json();
        // The backend should return the final, validated authentication token here.
        if (!json.success || !json.data?.token) {
          throw new Error(json.message || 'Verification failed: no token received from backend.');
        }

        // --- CRITICAL CONNECTION POINT ---
        // Set the received authentication token in a cookie. This cookie will be checked by the Login page on subsequent visits.
        // This is the actual session token.
        document.cookie = `authToken=${json.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

        // Clear the 'pendingToken' from localStorage. This signals to the Login component
        // that the email verification process has completed successfully.
        localStorage.removeItem('pendingToken');
        // --- END CRITICAL CONNECTION POINT ---


        setStatus('success');
        toast.success('Verification successful! Redirecting you now...', {
          id: 'success-toast',
          duration: 3000,
        });

        setTimeout(() => {
          // Redirect to the wholesaler dashboard after successful verification
          // The token is passed as a query param, but the primary authentication is now via the cookie.
          router.replace(`/wholesaler?token=${encodeURIComponent(json.data.token)}`);
        }, 2500);
      } catch (err: any) {
        console.error('Login verification error:', err);
        setStatus('error');
        const errorMessage = err.message || 'Verification failed. The link may have expired or is invalid.';
        toast.error(errorMessage, { id: 'verification-error-toast', duration: 7000 });
      }
    };

    verifyUser();
  }, [token, router, API_URL]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.4, ease: 'easeIn' } },
  };
  const iconVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 12, delay: 0.2 } },
  };
  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.97 },
  };

  let content;
  switch (status) {
    case 'pending':
      content = (
        <motion.div
          key="pending"
          className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 font-sans text-gray-800"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Toaster position="top-center" containerClassName="!top-10" />
          <motion.div
            className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-gray-100"
            variants={cardVariants}
          >
            <motion.div
              className="relative flex items-center justify-center w-20 h-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute w-full h-full border-4 border-t-4 border-blue-500 border-dashed rounded-full opacity-75 animate-spin-slow"></div>
              <svg
                className="h-10 w-10 text-blue-600 absolute"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-8 mb-3 text-center"
              variants={iconVariants}
            >
              Verifying Your Access
            </motion.h2>
            <motion.p className="text-md text-gray-600 text-center leading-relaxed" variants={iconVariants}>
              Please wait a moment while we securely verify your login link. This usually takes just a few
              seconds.
            </motion.p>
            <motion.p className="mt-4 text-gray-700 font-semibold" variants={iconVariants}>
              Link expires in{' '}
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, '0')}
              :
              {(timeLeft % 60).toString().padStart(2, '0')}
            </motion.p>
          </motion.div>
        </motion.div>
      );
      break;

    case 'success':
      content = (
        <motion.div
          key="success"
          className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 font-sans text-gray-800"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Toaster position="top-center" containerClassName="!top-10" />
          <motion.div
            className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-gray-100"
            variants={cardVariants}
          >
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 shadow-lg"
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
            <motion.h2 className="text-2xl md:text-3xl font-extrabold text-green-700 mt-8 mb-3 text-center" variants={iconVariants}>
              Verification Successful!
            </motion.h2>
            <motion.p className="text-md text-gray-600 mt-2 text-center leading-relaxed" variants={iconVariants}>
              Welcome back! You’re being securely logged in now.
            </motion.p>
          </motion.div>
        </motion.div>
      );
      break;

    case 'no-token':
    case 'error':
    default:
      content = (
        <motion.div
          key="error"
          className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 font-sans text-gray-800"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Toaster position="top-center" containerClassName="!top-10" />
          <motion.div
            className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center border border-gray-100"
            variants={cardVariants}
          >
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 shadow-lg"
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.div>
            <motion.h2 className="text-2xl md:text-3xl font-extrabold text-red-700 mt-8 mb-3 text-center" variants={iconVariants}>
              Verification Failed
            </motion.h2>
            <motion.p className="text-md text-gray-600 mt-2 leading-relaxed" variants={iconVariants}>
              {status === 'no-token'
                ? "The login link is missing or incomplete. Please ensure you clicked the full link from your email."
                : 'The link you used might be expired or invalid. Please request a new login link to proceed.'}
            </motion.p>
            <motion.button
              onClick={() => router.replace('/login')}
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Back to Login Page
            </motion.button>
          </motion.div>
        </motion.div>
      );
      break;
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
};

export default VerifyLoginPage;