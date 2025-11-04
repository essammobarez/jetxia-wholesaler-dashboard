'use client';
import React from 'react';
import { useState, useEffect, useCallback, FC, useRef } from 'react';

// Note: Metadata is handled by BrandingMetaUpdater component in root layout for client pages
import Image from 'next/image';
import { Eye, EyeOff, Loader, Mail, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { useInputChange } from '@/hooks/useInputsChange';
import { login as loginThunk } from '@/services/authServices';
import { verifyLogin } from '@/services/authServices';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import toast, { Toaster, Toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { authenticator } from 'otplib';
import { setToken } from "@/store/Slices/authSlice";
import { useRouter } from 'next/navigation';
import { getBaseUrl } from '@/helpers/config/envConfig';

// --- Custom Highlighted Warning Toast Component ---
const CustomWarningToast = ({ t, title, message }: { t: Toast; title: string; message: string }) => (
  <div
    className={`max-w-md w-full bg-white dark:bg-zinc-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-yellow-400`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {title}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
        </div>
      </div>
    </div>
    <div className="flex items-center px-2">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5 text-zinc-500" />
      </button>
    </div>
  </div>
);


// --- OTP Input Component for Google Auth (Numeric only) ---
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
        <div className="flex justify-center gap-2 my-2" onPaste={handlePaste}>
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
                    className="w-12 h-12 text-center text-xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
        <div className="flex justify-center gap-2 my-2" onPaste={handlePaste}>
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
                    className="w-12 h-12 text-center text-xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
            ))}
        </div>
    );
};

const muiTheme = createTheme({
    palette: {
        primary: { main: '#2563EB' },
    },
    components: {
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                margin: 'dense',
            },
            styleOverrides: {
                root: {
                    '& .MuiInputLabel-root': {
                        color: '#4B5563',
                        '&.Mui-focused': { color: '#2563EB' },
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                        '& input': { color: '#1F2937' },
                    },
                },
            },
        },
    },
});

const COUNTDOWN_KEY = "loginLinkExpireTs";

type Stage = 'form' | 'verify-email' | 'verify-google';
type VerificationType = 'email' | 'google';
interface LoginFormData {
    email: string;
    password: string;
}

const FIVE_MINUTES_SECONDS = 5 * 60;

const LoginPage: React.FC = () => {
    const { formData, handleInputChange } = useInputChange<LoginFormData>({ email: '', password: '' });
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const [stage, setStage] = useState<Stage>('form');
    const [verificationType, setVerificationType] = useState<VerificationType>('email');
    const [gAuthToken, setGAuthToken] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [gAuthSecret, setGAuthSecret] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [isNewGAuthSetup, setIsNewGAuthSetup] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const website = 'www.bdesktravel.com';
                const apiUrl = `${getBaseUrl()}/wholesaler/getbywebsite/?website=${website}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error('Failed to fetch logo');
                }

                const result = await response.json();
                if (result.success && result.data?.logo) {
                    setLogoUrl(result.data.logo);
                } else {
                    console.warn('API response successful, but no logo URL found.');
                }
            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };

        fetchLogo();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedTs = localStorage.getItem(COUNTDOWN_KEY);
        if (storedTs) {
            const expireTs = parseInt(storedTs, 10);
            const diff = Math.floor((expireTs - Date.now()) / 1000);
            if (diff > 0) {
                setSecondsLeft(diff);
                setStage('verify-email');
            } else {
                localStorage.removeItem(COUNTDOWN_KEY);
            }
        }
    }, []);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    localStorage.removeItem(COUNTDOWN_KEY);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === COUNTDOWN_KEY && e.newValue === null) {
                setSecondsLeft(0);
            }
            if (e.key === "justVerified" || e.key === "auth" || e.key === "accessToken") {
                window.location.href = "/";
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Debug: Log stage changes
    useEffect(() => {
        console.log('Current stage:', stage);
    }, [stage]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60), s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleSendEmailOtp = useCallback(async () => {
        if (loading) return;
        if (!formData.email || !formData.password) {
            toast.error("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                email: formData.email.toLowerCase(),
                password: formData.password,
                type: 'agency',
            };
            
            // Call the login API to send OTP
            const apiUrl = `${getBaseUrl()}/auth/login`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Invalid credentials or server error.');
            }
            
            console.log('Login result:', result);
            
            // Set countdown timer
            const expireTs = Date.now() + FIVE_MINUTES_SECONDS * 1000;
            localStorage.setItem(COUNTDOWN_KEY, expireTs.toString());
            setSecondsLeft(FIVE_MINUTES_SECONDS);
            
            // Change to email verification stage with OTP input
            console.log('Changing stage to verify-email');
            setStage('verify-email');
            toast.success('OTP sent to your email! Check your inbox.');
            
        } catch (err: any) {
            console.error('Send email OTP failed:', err);
            toast.error(err.message || 'Failed to send OTP');
            setSecondsLeft(0);
            localStorage.removeItem(COUNTDOWN_KEY);
            setStage('form'); // Stay on form if error
        } finally {
            setLoading(false);
        }
    }, [formData.email, formData.password, loading]);


    const handleInitiateGoogleAuth = async () => {
        if (loading) return;
        if (!formData.email || !formData.password) {
            toast.error("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            const initialPayload = {
                email: formData.email.toLowerCase(),
                password: formData.password,
                type: 'agency',
            };

            const authApiUrl = `${getBaseUrl()}/auth/google-authenticator`;
            const response = await fetch(authApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialPayload),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Invalid credentials or server error.');
            }
            
            if (result.data && result.data.googleAuth === false) {
                toast.custom(
                    (t) => (
                        <CustomWarningToast
                            t={t}
                            title="Action Required: 2FA Not Enabled"
                            message="Please log in with Email OTP first. You can enable Google Authenticator in your account settings after logging in."
                        />
                    ),
                    {
                        duration: 8000,
                    }
                );
                return; 
            }

            let finalSecretKey = '';

            if (result.data && result.data.secretKey) {
                finalSecretKey = result.data.secretKey;
                setIsNewGAuthSetup(false);
                toast.success('Open your authenticator app to get the code.');
            } else {
                const newSecret = authenticator.generateSecret();
                finalSecretKey = newSecret;
                setIsNewGAuthSetup(true);

                const saveKeyPayload = {
                    email: formData.email.toLowerCase(),
                    password: formData.password,
                    secretKey: newSecret,
                };
                const saveKeyApiUrl = `${getBaseUrl()}/auth/save-secret-key`;

                const saveResponse = await fetch(saveKeyApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(saveKeyPayload),
                });

                if (!saveResponse.ok) {
                    const saveErrorResult = await saveResponse.json();
                    throw new Error(saveErrorResult.message || 'Could not save the new 2FA secret key.');
                }

                toast.success('One-time setup: Scan the QR code with your authenticator app.');
            }

            const otpauth = authenticator.keyuri(formData.email.toLowerCase(), 'Jetixa Travel Technology', finalSecretKey);
            setGAuthSecret(finalSecretKey);
            setQrCodeData(otpauth);
            setStage('verify-google');

        } catch (err: any) {
            console.error('Google Authenticator initiation failed:', err);
            toast.error(err.message || 'Failed to start 2FA setup.');
            setQrCodeData(null);
            setGAuthSecret(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuthSubmit = async () => {
        if (loading) return;
        if (gAuthToken.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }
        if (!formData.email || !formData.password || !gAuthSecret) {
            toast.error("Session expired. Please go back and re-enter your credentials.");
            return;
        }

        const isTokenValid = authenticator.check(gAuthToken, gAuthSecret);
        if (!isTokenValid) {
            toast.error("Invalid code. Please check your app and try again.");
            setGAuthToken('');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: formData.email.toLowerCase(),
                password: formData.password,
                token: gAuthToken,
                type: 'agency',
            };

            const apiUrl = `${getBaseUrl()}/auth/google-authenticator`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Invalid 2FA code or server error.');
            }

            const apiData = result.data;
            const accessToken = apiData?.accessToken;

            if (!accessToken) {
                throw new Error("Login successful, but no access token was returned.");
            }

            const reduxPayload = {
                ...apiData,
                token: accessToken,
            };

            dispatch(setToken({ data: reduxPayload }));
            localStorage.setItem("justVerified", "true");
            toast.success(result.message || 'Login Successful!');

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (err: any) {
            console.error('Google Authenticator login failed:', err);
            toast.error(err.message || 'Login failed. Please check your code.');
            setGAuthToken('');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (loading) return;
        if (emailOtp.length !== 6) {
            toast.error("Please enter a valid 6-character OTP.");
            return;
        }
        if (!formData.email) {
            toast.error("Session expired. Please go back and re-enter your credentials.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                email: formData.email.toLowerCase(),
                code: emailOtp,
            };

            const apiUrl = `${getBaseUrl()}/auth/verify-otp`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Invalid OTP or server error.');
            }

            const apiData = result.data;
            const accessToken = apiData?.accessToken || apiData?.token;

            if (!accessToken) {
                throw new Error("Verification successful, but no access token was returned.");
            }

            const reduxPayload = {
                ...apiData,
                token: accessToken,
            };

            dispatch(setToken({ data: reduxPayload }));
            localStorage.setItem("justVerified", "true");
            localStorage.removeItem(COUNTDOWN_KEY);
            toast.success(result.message || 'Login Successful!');

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (err: any) {
            console.error('Email OTP verification failed:', err);
            toast.error(err.message || 'Verification failed. Please check your OTP.');
            setEmailOtp('');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailToken = async (token: string) => {
        try {
            const res = await dispatch(verifyLogin(token)).unwrap();
            if (res.data && res.data.token) {
                dispatch(setToken({ data: res.data }));
                localStorage.setItem("justVerified", "true");

                toast.success("Verification successful! You're being securely logged in...", {
                    id: 'success-toast',
                    duration: 3000,
                });
                setTimeout(() => {
                    router.replace("/");
                }, 2500);
            } else {
                toast.error("Verification succeeded but no authentication token was received. Please try logging in again.", {
                    id: 'no-auth-token-toast',
                    duration: 6000,
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Verification failed. Please try again.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationType === 'email') {
            handleSendEmailOtp();
        } else if (verificationType === 'google') {
            handleInitiateGoogleAuth();
        }
    };

    const handleEmailOtpFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleVerifyEmailOtp();
    };

    const handleGoogleAuthFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGoogleAuthSubmit();
    };

    const handleBackToForm = () => {
        localStorage.removeItem(COUNTDOWN_KEY);
        setSecondsLeft(0);
        setStage('form');
        setGAuthToken('');
        setEmailOtp('');
        setQrCodeData(null);
        setGAuthSecret(null);
        setIsNewGAuthSetup(false);
    };

    useEffect(() => {
        if (stage === 'verify-email' && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                handleVerifyEmailToken(token);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [stage]);

    return (
        <ThemeProvider theme={muiTheme}>
            <div className="flex min-h-screen items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
                <Toaster position="top-right" />
                {/* Debug indicator - Remove this in production */}
                <div className="fixed top-4 left-4 bg-black text-white px-3 py-1 rounded text-xs z-50">
                    Stage: {stage}
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-[7fr_3fr] w-full max-w-[1300px] mx-auto rounded-t-[15px] overflow-hidden shadow-sm">
                    {stage === 'form' && (
                        <>
                            <div className="bg-white p-4 md:p-6 relative">
                                <div className="relative z-10 flex flex-col justify-center items-center gap-1">
                                    <div className="relative w-full flex justify-center mb-2">
                                        <Image
                                            src="/images/Vector.svg"
                                            alt="Top of Logo Decor"
                                            width={180}
                                            height={90}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex justify-center items-center rounded-2xl mb-4 h-[100px]">
                                        {logoUrl && (
                                            <Image
                                                src={logoUrl}
                                                alt="Wholesaler Logo"
                                                width={180}
                                                height={80}
                                                className="h-auto object-contain"
                                                priority
                                            />
                                        )}
                                    </div>
                                    <div className="text-center -mt-4 mb-2">
                                        <h1 className="text-xl font-bold text-blue-600">Welcome</h1>
                                        <p className="text-gray-600 mt-1 text-sm">Login with your credentials</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-2 w-full max-w-sm relative">
                                        <div className="relative">
                                            <TextField
                                                id="email"
                                                name="email"
                                                label="Email"
                                                placeholder="john.doe@gmail.com"
                                                type="email"
                                                required
                                                fullWidth
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <div className="absolute -mt-20 -left-24 top-1/2 transform -translate-x-[140%] -translate-y-1/2 hidden sm:block">
                                                <Image src="/images/Vector-l1.svg" alt="Email field left decoration" width={80} height={60} className="object-contain" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <TextField
                                                id="password"
                                                name="password"
                                                label="Password"
                                                placeholder="••••••••••••••"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                fullWidth
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton edge="end" onClick={() => setShowPassword(v => !v)} aria-label="toggle password visibility">
                                                                {showPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2 pt-1">
                                            <p className="text-sm font-medium text-gray-700">Verification Method</p>
                                            <div className="grid grid-cols-2 gap-2 mb-5">
                                                <label onClick={() => setVerificationType('email')} className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${verificationType === 'email' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                                    <input type="radio" name="verificationType" value="email" checked={verificationType === 'email'} onChange={() => setVerificationType('email')} className="hidden" />
                                                    <Mail className={`w-4 h-4 mr-2 ${verificationType === 'email' ? 'text-blue-600' : 'text-gray-500'}`} />
                                                    <span className={`text-sm font-semibold ${verificationType === 'email' ? 'text-blue-700' : 'text-gray-800'}`}>Verify by Email</span>
                                                </label>
                                                <label onClick={() => setVerificationType('google')} className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${verificationType === 'google' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                                    <input type="radio" name="verificationType" value="google" checked={verificationType === 'google'} onChange={() => setVerificationType('google')} className="hidden" />
                                                    <ShieldCheck className={`w-4 h-4 mr-2 ${verificationType === 'google' ? 'text-blue-600' : 'text-gray-500'}`} />
                                                    <span className={`text-sm font-semibold ${verificationType === 'google' ? 'text-blue-700' : 'text-gray-800'}`}>G-Authenticator</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-1">
                                            <label className="flex items-center text-gray-600 select-none">
                                                <input type="checkbox" className="mr-1.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                Remember me
                                            </label>
                                            <a href="/forget-password" className="text-blue-600 hover:underline font-medium">Forgot password?</a>
                                        </div>
                                        <div className="relative flex items-center justify-center pt-2">
                                            <div className="absolute -left-20 transform -translate-x-[90%] -mt-20 -translate-y-1/2 hidden sm:block">
                                                <Image src="/images/Vector-l2.svg" alt="Login button left decoration" width={160} height={100} className="object-contain" />
                                            </div>
                                            <button type="submit" disabled={loading} className={`py-2 px-12 rounded-md bg-blue-600 text-white font-semibold uppercase tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {loading ? <><Loader className="animate-spin mr-2 h-5 w-5 inline-block" /> Continuing...</> : 'Continue'}
                                            </button>
                                            <div className="absolute -right-20 -mt-[240px] transform translate-x-[120%] -translate-y-1/2 hidden sm:block">
                                                <Image src="/images/Vector-r.svg" alt="Login button right decoration" width={150} height={140} className="object-contain" />
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-gray-600 pt-1">
                                            Don't have an account?{' '}
                                            <a href="/registration" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">Register Now</a>
                                        </p>
                                    </form>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center py-4 pr-4 flex-1 relative w-[450px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 8.6%, rgba(0, 0, 0, 0.00) 43.04%), url('/images/login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                <div className="relative z-10 w-full flex flex-col items-center px-2">
                                    <p className="text-white -mt-20 text-2xl font-semibold leading-tight text-center" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                                        See the world from a <br /> new perspective.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                    {stage === 'verify-email' && (
                        <>
                            <div className="bg-white p-4 md:p-6 relative flex flex-col items-center justify-center">
                                <div className="relative z-10 flex flex-col justify-center items-center gap-1 w-full max-w-lg">
                                    <div className="flex justify-center items-center rounded-2xl mb-1 h-[100px]">
                                        {logoUrl && (
                                            <Image
                                                src={logoUrl}
                                                alt="Logo"
                                                width={200}
                                                height={100}
                                                className="h-auto object-contain"
                                                priority
                                            />
                                        )}
                                    </div>
                                    <div className="text-center mb-2">
                                        <h2 className="text-2xl font-bold text-gray-800">Verify your email address</h2>
                                        <p className="text-gray-600 text-sm mt-2">
                                            An OTP has been sent to <br />
                                            <span className="font-bold text-green-600 text-lg">{formData.email.toLowerCase()}</span>
                                        </p>
                                    </div>
                                    <form onSubmit={handleEmailOtpFormSubmit} className="w-full max-w-sm mt-1">
                                        <p className="text-gray-500 text-sm font-medium text-center mb-2">Enter the 6-character code</p>
                                        <EmailOtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
                                        {secondsLeft > 0 && (
                                            <div className="flex justify-center mt-2">
                                                <div className="px-4 py-1 border border-gray-300 rounded-lg">
                                                    <span className="text-sm font-mono text-gray-600">Expires in {formatTime(secondsLeft)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2 mt-3">
                                            <button type="submit" disabled={loading || emailOtp.length !== 6} className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-blue-600 text-white font-semibold uppercase tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${(loading || emailOtp.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {loading ? <><Loader className="animate-spin mr-2 h-5 w-5" /> Verifying...</> : 'Verify to Login'}
                                            </button>
                                            <button type="button" onClick={handleBackToForm} className="w-full py-2 px-4 text-center text-blue-600 hover:underline text-sm mt-2">Back to edit email</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center py-4 pr-4 flex-1 relative w-[450px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 8.6%, rgba(0, 0, 0, 0.00) 43.04%), url('/images/login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                <div className="relative z-10 w-full flex flex-col items-center px-2">
                                    <p className="text-white text-2xl -mt-28 font-semibold leading-tight text-center" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>Almost there! <br /> Check your inbox.</p>
                                </div>
                            </div>
                        </>
                    )}
                    {stage === 'verify-google' && (
                        <>
                            <div className="bg-white p-4 md:p-6 relative flex flex-col items-center justify-center">
                                <div className="relative z-10 flex flex-col justify-center items-center gap-1 w-full max-w-lg text-center">
                                    <div className="flex justify-center items-center rounded-2xl mb-1 h-[100px]">
                                        {logoUrl && (
                                            <Image
                                                src={logoUrl}
                                                alt="Logo"
                                                width={200}
                                                height={100}
                                                className="h-auto object-contain"
                                                priority
                                            />
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Two-Factor Authentication</h2>
                                    <p className="text-gray-600 text-sm mt-1 mb-2">
                                        {isNewGAuthSetup
                                            ? "Scan the image below with your authenticator app for one-time setup."
                                            : "Open your authenticator app to get the verification code."
                                        }
                                    </p>

                                    {isNewGAuthSetup && qrCodeData && gAuthSecret && (
                                        <div className='w-full max-w-xs'>
                                            <div className="p-2 bg-white border rounded-lg shadow-md my-2 inline-block">
                                                <QRCode
                                                    value={qrCodeData}
                                                    size={160}
                                                    level={"H"}
                                                    style={{ height: "auto", maxWidth: "100%", width: "160px" }}
                                                />
                                            </div>
                                            <div className="mt-1 text-center">
                                                <p className="text-gray-600 text-xs">
                                                    Or enter this key manually:
                                                </p>
                                                <p className="font-mono bg-gray-100 text-gray-800 p-1.5 rounded-md mt-1 break-all text-xs">
                                                    {gAuthSecret}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleGoogleAuthFormSubmit} className="w-full max-w-sm mt-1">
                                        <p className="text-gray-500 text-sm font-medium">Enter the 6-digit code for <span className="font-bold text-blue-600">{formData.email.toLowerCase()}</span></p>
                                        <OtpInput length={6} value={gAuthToken} onChange={setGAuthToken} />
                                        <div className="space-y-2 mt-3">
                                            <button type="submit" disabled={loading || gAuthToken.length !== 6} className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-blue-600 text-white font-semibold uppercase tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${ (loading || gAuthToken.length !== 6) ? 'opacity-50 cursor-not-allowed' : '' }`}>
                                                {loading ? <><Loader className="animate-spin mr-2 h-5 w-5" /> Verifying...</> : 'Verify & Login'}
                                            </button>
                                            <button type="button" onClick={handleBackToForm} disabled={loading} className="w-full py-2 px-4 text-center text-blue-600 hover:underline text-sm mt-2 disabled:opacity-50">
                                                Back to Login
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center py-4 pr-4 flex-1 relative w-[450px] h-[662px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 8.6%, rgba(0, 0, 0, 0.00) 43.04%), url('/images/login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                <div className="relative z-10 w-full flex flex-col items-center px-2">
                                    <p className="text-white text-2xl -mt-28 font-semibold leading-tight text-center" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                                        Security Check <br /> One more step.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="absolute bottom-2 left-2 hidden sm:block">
                        <Image src="/images/Vector5.svg" alt="Bottom Left Decoration" width={160} height={140} className="object-contain" />
                    </div>
                    <div className="absolute bottom-2 right-[470px] hidden sm:block">
                        <Image src="/images/Vector6.svg" alt="Bottom Right Decoration" width={160} height={140} className="object-contain" />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default LoginPage;
