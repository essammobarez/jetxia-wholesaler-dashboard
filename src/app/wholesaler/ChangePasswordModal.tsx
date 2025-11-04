'use client';
import React, { useState, FC, FormEvent, ChangeEvent, FocusEvent } from 'react';
import {
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// --- HELPER FUNCTIONS & TYPES ---

/**
 * Grabs the auth token from cookies or localStorage.
 */
const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('authToken='))
    ?.split('=')[1] || localStorage.getItem('authToken');
};

// State type for password validation
interface PasswordValidationState {
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  has8Chars: boolean;
}

// --- COMPONENT INTERFACE ---

interface ChangePasswordModalProps {
  onClose: () => void;
  onSaveSuccess: () => void;
}

// --- PASSWORD INPUT COMPONENT ---

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * A reusable password input field with a show/hide toggle.
 */
const PasswordInput: FC<PasswordInputProps> = ({ id, label, value, onChange, showPassword, onToggleShow, autoComplete = "off", onFocus }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        required
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 pr-10"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

// New component for rendering password requirements
const PasswordRequirement: FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
  <li className={`flex items-center gap-2 text-sm ${isValid ? 'text-emerald-500' : 'text-red-500'}`}>
    {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    <span>{text}</span>
  </li>
);


// --- MAIN MODAL COMPONENT ---

const ChangePasswordModal: FC<ChangePasswordModalProps> = ({ onClose, onSaveSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [validation, setValidation] = useState<PasswordValidationState>({
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    has8Chars: false,
  });

  const [isNewPasswordInteracted, setIsNewPasswordInteracted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pass = e.target.value;
    setNewPassword(pass);
    
    // Update validation state
    setValidation({
      hasLower: /[a-z]/.test(pass),
      hasUpper: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      has8Chars: pass.length >= 8,
    });
  };

  const allRequirementsMet = Object.values(validation).every(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // This check is still good for showing a UI error
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    
    if (!allRequirementsMet) {
        setError("New password does not meet all requirements.");
        return;
    }

    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to update password. Please check your current password.');
      }

      onSaveSuccess(); // Calls parent to show success toast
      onClose(); // Closes modal

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-300 scale-95 animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Change Password
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            showPassword={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
            autoComplete="current-password"
          />
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={handlePasswordChange}
            showPassword={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            autoComplete="new-password"
            onFocus={() => setIsNewPasswordInteracted(true)}
          />
          
          <PasswordInput
            id="confirmNewPassword"
            label="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            autoComplete="new-password"
          />

          {isNewPasswordInteracted && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Password Requirements:
              </p>
              <ul className="space-y-1">
                <PasswordRequirement isValid={validation.hasLower} text="At least one lowercase letter" />
                <PasswordRequirement isValid={validation.hasUpper} text="At least one uppercase letter" />
                <PasswordRequirement isValid={validation.hasNumber} text="At least one number" />
                <PasswordRequirement isValid={validation.has8Chars} text="Minimum 8 characters long" />
              </ul>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword ||
                !allRequirementsMet ||
                newPassword !== confirmNewPassword // UPDATED: Added mismatch check
              }
              className="px-5 py-2.5 rounded-lg flex items-center justify-center bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;