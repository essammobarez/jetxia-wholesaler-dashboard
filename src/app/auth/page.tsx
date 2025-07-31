'use client';

import { useState, FormEvent, useEffect } from 'react';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Define a type for our user object for better code quality
interface User {
  id: number;
  email: string;
  password: string;
  secret: string;
}

// --- (Simulated Server/Database) ---
const FAKE_USERS_DB: User[] = [
  { id: 1, email: 'user@example.com', password: 'password123', secret: '' },
  { id: 2, email: 'zahid@gmail.com', password: '123456', secret: '' },
  { id: 3, email: 'zahid1@gmail.com', password: '123456', secret: '' },
];
// ------------------------------------

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'password'|'setup'|'verify'|'success'>('password');

  const [currentUser, setCurrentUser] = useState<User|null>(null);
  const [setupSecret, setSetupSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Step 1: Handle initial password login
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const user = FAKE_USERS_DB.find(u => u.email === email);
    if (!user || user.password !== password) {
      setError('Invalid email or password.');
      return;
    }

    setCurrentUser(user);

    // see if we already have one-time secret in localStorage for this email
    const storageKey = `secret_${user.email}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      // skip setup, use stored secret
      user.secret = stored;
      console.log(`Loaded saved 2FA secret for ${user.email}:`, stored);
      setStep('verify');
      return;
    }

    if (user.secret) {
      // fallback if DB has it (in a real app)
      setStep('verify');
    } else {
      // generate fresh secret, store and log it
      const newSecret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(user.email, 'Your Awesome App', newSecret);

      // persist for future logins
      localStorage.setItem(storageKey, newSecret);
      console.log(`Generated & saved new 2FA secret for ${user.email}:`, newSecret);

      setSetupSecret(newSecret);
      const qrUrl = await QRCode.toDataURL(otpAuthUrl);
      setQrCodeDataUrl(qrUrl);
      setStep('setup');
    }
  };

  // Step 2: Handle one-time setup verification
  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentUser || !setupSecret) {
      setError('An error occurred. Please try logging in again.');
      setStep('password');
      return;
    }

    const isValid = authenticator.verify({ token, secret: setupSecret });
    if (!isValid) {
      setError('Invalid 2FA code. Please scan the QR and try again.');
      return;
    }

    // commit to our fake DB and localStorage
    currentUser.secret = setupSecret;
    localStorage.setItem(`secret_${currentUser.email}`, setupSecret);
    setStep('success');
  };

  // Step 3: Handle verification for subsequent logins
  const handleVerificationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentUser) {
      setError('An error occurred. Please try logging in again.');
      setStep('password');
      return;
    }
    const secret = localStorage.getItem(`secret_${currentUser.email}`) || currentUser.secret;
    const isValid = authenticator.verify({ token, secret });
    if (isValid) {
      setStep('success');
    } else {
      setError('Invalid 2FA code.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'password':
        return (
          <form onSubmit={handlePasswordSubmit}>
            <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Login</h1>
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border p-2"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-md border p-2"
                required
              />
            </div>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Login
            </button>
          </form>
        );
      case 'setup':
        return (
          <form onSubmit={handleSetupSubmit}>
            <h2 className="mb-4 text-center text-2xl font-bold">Set Up 2-Factor Authentication</h2>
            <p className="mb-4 text-center text-sm text-gray-600">
              Scan this QR code with your authenticator app. This will only be shown once.
            </p>
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="mx-auto my-4 rounded-lg border"
              />
            )}
            <p className="mb-4 break-all text-center text-xs text-gray-500">
              Or manually enter: <span className="font-mono">{setupSecret}</span>
            </p>
            <label htmlFor="token" className="mb-2 block text-sm font-medium text-gray-600">
              Verification Code
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full rounded-md border p-2"
              placeholder="Enter 6-digit code"
              required
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Verify & Complete Setup
            </button>
          </form>
        );
      case 'verify':
        return (
          <form onSubmit={handleVerificationSubmit}>
            <h2 className="mb-4 text-center text-2xl font-bold">Enter Verification Code</h2>
            <p className="mb-4 text-center text-sm text-gray-600">
              Open your authenticator app and enter the code for your account.
            </p>
            <label htmlFor="token" className="mb-2 block text-sm font-medium text-gray-600">
              6-Digit Code
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full rounded-md border p-2"
              placeholder="123456"
              required
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Verify
            </button>
          </form>
        );
      case 'success':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600">✅ Welcome!</h1>
            <p className="mt-2 text-lg text-gray-700">You have successfully logged in.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {renderStep()}
        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
