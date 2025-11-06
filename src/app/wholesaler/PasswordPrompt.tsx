// PasswordPrompt.tsx

import React, { useState } from "react";
import { KeyRound, Loader2, AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface PasswordPromptProps {
  onCancel: () => void;
  onConfirm: (password: string) => void;
  isLoading: boolean;
  apiError: string | null;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  onCancel,
  onConfirm,
  isLoading,
  apiError,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirmClick = () => {
    if (password) {
      onConfirm(password);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && password && !isLoading) {
        handleConfirmClick();
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700/50 p-6 bg-zinc-50 dark:bg-zinc-900/50">
        <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">Confirm Your Identity</h4>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            To proceed with this security change, please enter your current password.
        </p>
        
        <div className="mt-4 max-w-sm space-y-3">
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                </span>
                <input
                    type={showPassword ? "text" : "password"}
                    name="password-confirm"
                    id="password-confirm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block w-full rounded-md border-0 bg-white dark:bg-zinc-800 py-2.5 pl-10 pr-10 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6 transition-colors"
                    placeholder="Enter your password"
                    autoFocus
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                </button>
            </div>

            {apiError && (
                 <div className="flex items-center gap-x-2 text-sm text-red-600 dark:text-red-500">
                    <AlertCircle size={16} />
                    <span>{apiError}</span>
                 </div>
            )}
        </div>
        
        <div className="mt-6 flex justify-start gap-x-3">
            <button
                type="button"
                onClick={handleConfirmClick}
                disabled={isLoading || !password}
                className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Confirming...
                    </>
                ) : (
                    <>
                        <CheckCircle className="-ml-1 h-5 w-5" />
                        Confirm & Enable
                    </>
                )}
            </button>
            <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
                <XCircle className="-ml-1 h-5 w-5" />
                Cancel
            </button>
        </div>
    </div>
  );
};

export default PasswordPrompt;