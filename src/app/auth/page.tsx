'use client';

import { useState, FormEvent } from 'react';
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
// The database is now an array to hold multiple users.
// In a real app, you would query a real database to find a user.
const FAKE_USERS_DB: User[] = [
  { id: 1, email: 'user@example.com', password: 'password123', secret: '' },
  { id: 2, email: 'zahid@gmail.com', password: '123456', secret: '' },
  { id: 3, email: 'zahid1@gmail.com', password: '123456', secret: '' },
];
// ------------------------------------

export default function LoginPage() {
  // Form and flow state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('password');

  // State to hold the currently active user object after password validation
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for the temporary secret and QR code during the one-time setup
  const [setupSecret, setSetupSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Step 1: Handle initial password login
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Find the user in our fake database
    const user = FAKE_USERS_DB.find(u => u.email === email);

    // Check if user exists and password is correct
    if (user && user.password === password) {
      setCurrentUser(user); // Set the active user for the next steps

      if (user.secret) {
        // User already has 2FA, go to verification
        setStep('verify');
      } else {
        // First time 2FA setup for this user
        const newSecret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(user.email, 'Your Awesome App', newSecret);
        
        setSetupSecret(newSecret);
        const qrUrl = await QRCode.toDataURL(otpAuthUrl);
        setQrCodeDataUrl(qrUrl);
        
        setStep('setup');
      }
    } else {
      setError('Invalid email or password.');
    }
  };

  // Step 2: Handle one-time setup verification
  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Ensure we have a current user and a temporary secret
    if (!currentUser || !setupSecret) {
      setError("An error occurred. Please try logging in again.");
      setStep('password');
      return;
    }

    const isValid = authenticator.verify({ token, secret: setupSecret });

    if (isValid) {
      // Save the secret to the correct user in our fake DB
      currentUser.secret = setupSecret;
      setStep('success');
    } else {
      setError('Invalid 2FA code. Please scan the QR and try again.');
    }
  };

  // Step 3: Handle verification for subsequent logins
  const handleVerificationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError("An error occurred. Please try logging in again.");
      setStep('password');
      return;
    }

    // Verify token against the user's saved secret
    const isValid = authenticator.verify({ token, secret: currentUser.secret });
    
    if (isValid) {
      setStep('success');
    } else {
      setError('Invalid 2FA code.');
    }
  };

  // The rendering logic does not need changes
  const renderStep = () => {
    switch (step) {
      case 'password':
        return (
          <form onSubmit={handlePasswordSubmit}>
            <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Login</h1>
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-600">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border p-2" required />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-600">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border p-2" required />
            </div>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Login</button>
          </form>
        );
      case 'setup':
        return (
          <form onSubmit={handleSetupSubmit}>
            <h2 className="mb-4 text-center text-2xl font-bold">Set Up 2-Factor Authentication</h2>
            <p className="mb-4 text-center text-sm text-gray-600">Scan this QR code with your authenticator app. This will only be shown once.</p>
            {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto my-4 rounded-lg border" />}
            <p className="mb-4 break-all text-center text-xs text-gray-500">Or manually enter: <span className="font-mono">{setupSecret}</span></p>
            <label htmlFor="token" className="mb-2 block text-sm font-medium text-gray-600">Verification Code</label>
            <input type="text" id="token" value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded-md border p-2" placeholder="Enter 6-digit code" required />
            <button type="submit" className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Verify & Complete Setup</button>
          </form>
        );
      case 'verify':
        return (
          <form onSubmit={handleVerificationSubmit}>
            <h2 className="mb-4 text-center text-2xl font-bold">Enter Verification Code</h2>
            <p className="mb-4 text-center text-sm text-gray-600">Open your authenticator app and enter the code for your account.</p>
            <label htmlFor="token" className="mb-2 block text-sm font-medium text-gray-600">6-Digit Code</label>
            <input type="text" id="token" value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded-md border p-2" placeholder="123456" required />
            <button type="submit" className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Verify</button>
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