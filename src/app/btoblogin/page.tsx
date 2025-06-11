'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField } from './loginInputField';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          type: 'wholesaler', // ← Default to wholesaler
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const ct = res.headers.get('Content-Type') || '';
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON, but got: ${txt.substring(0, 200)}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Login failed');
      }

      const token = json.data.token as string;
      localStorage.setItem('authToken', token);

      setMessage('Login successful!');
      setMessageType('success');

      router.push(`/wholesaler?token=${encodeURIComponent(token)}`);
    } catch (err: any) {
      console.error('Login error:', err);
      setMessage(err.message || 'Login failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-10">


      <div className="relative flex flex-col md:flex-row w-full max-w-5xl overflow-hidden rounded-lg bg-gray-50 p-6 sm:p-20 shadow-lg">
        <div className="w-full md:w-1/2 p-6 sm:p-10 pt-10">
          <h1 className="text-3xl text-center font-bold mb-5">Login</h1>
          <p className="text-gray-600 text-center">Login to access your account</p>

          {message && (
            <div
              className={`mt-4 p-3 rounded text-center ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mt-4">
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="/registration" className="text-blue-500">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full rounded py-3 text-white ${
                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center">
            Don’t have an account? <a href="/registration" className="text-blue-500">Register Now</a>
          </p>
        </div>

        <div className="w-full md:w-1/2 relative h-64 sm:h-auto">
          <Image
            src="/images/login-image.png"
            alt="Hotel"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
}
