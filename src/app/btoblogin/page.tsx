'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField } from './loginInputField';
import Image from 'next/image';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            color: "#4B5563",
            "&.Mui-focused": {
              color: "#2563EB",
            },
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#E5E7EB",
            },
            "&:hover fieldset": {
              borderColor: "#D1D5DB",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563EB",
            },
            "& input": {
              color: "#1F2937",
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
    <ThemeProvider theme={muiTheme}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-10">
        <Toaster position="top-right" />

        <div className="relative grid grid-cols-1 md:grid-cols-[7fr_3fr] w-full max-w-7xl mx-auto overflow-hidden rounded-lg bg-white shadow-lg">
          {/* ==== LEFT: Login form panel ==== */}
          <div className="relative bg-white p-6 sm:p-10">
            {/* Decorative absolute images */}
            <Image
              src="/images/Vector.svg"
              alt="Decorative"
              width={200}
              height={150}
              className="absolute top-10 left-4 opacity-50 z-0"
            />
            <Image
              src="/images/Vector2.svg"
              alt="Decorative"
              width={90}
              height={70}
              className="absolute top-1/3 right-4 opacity-50 z-0"
            />
            <Image
              src="/images/Vector4.png"
              alt="Decorative"
              width={110}
              height={50}
              className="absolute bottom-28 right-8 opacity-50 z-0"
            />
            <Image
              src="/images/Vector.jpg"
              alt="Decorative"
              width={120}
              height={70}
              className="absolute bottom-4 left-2 opacity-50 z-0"
            />
            <Image
              src="/images/Vector6.png"
              alt="Decorative"
              width={120}
              height={70}
              className="absolute bottom-4 right-2 opacity-50 z-0"
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/logo.jpg"
                  alt="Logo"
                  width={180}
                  height={90}
                  className="h-auto"
                  priority
                />
              </div>

              <h1 className="text-3xl font-bold text-blue-600 text-center">Welcome</h1>
              <p className="text-gray-600 mt-1 text-center mb-6">Login to access your account</p>

              {message && (
                <div
                  className={`w-full max-w-md mt-4 p-3 rounded text-center ${
                    messageType === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-md mt-6 space-y-4">
                <InputField
                  label="Username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  toggleShowPassword={() => setShowPassword(!showPassword)}
                  required
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

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 py-3 rounded-md text-white font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${
                    loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* <p className="mt-4 text-center text-sm text-gray-600">
                Don’t have an account?{' '}
                <a href="/registration" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                  Register Now
                </a>
              </p> */}
            </div>
          </div>

          {/* ==== RIGHT: Illustration panel ==== */}
          <div
            className="hidden md:flex items-center justify-center relative"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 8.6%, rgba(0, 0, 0, 0.00) 43.04%), url('/images/login.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative z-10 w-full flex flex-col items-center px-4">
              <p
                className="text-white text-3xl font-semibold leading-tight text-center -mt-28"
                style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.7)" }}
              >
                See the world from a <br /> new perspective.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
