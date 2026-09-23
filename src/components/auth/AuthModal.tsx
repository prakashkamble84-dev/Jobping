import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InputField } from '../common/InputField';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { AuthMode, User } from '../../types';
import { signUpWithEmail, loginWithEmail, sendResetPassword, loadDemoAccount } from '../../services/authService';
import { isFirebaseConfigured } from '../../services/firebaseConfig';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: User, isNewUser?: boolean) => void;
  id?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess,
  id = 'auth-modal',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Sync mode when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
    setResetSent(false);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const user = await signUpWithEmail(name, email, password);
        onSuccess(user, true);
        onClose();
      } else if (mode === 'signin') {
        const user = await loginWithEmail(email, password);
        onSuccess(user, false);
        onClose();
      } else if (mode === 'forgot_password') {
        await sendResetPassword(email);
        setResetSent(true);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await loadDemoAccount();
      onSuccess(user, false);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load demo account.');
    } finally {
      setLoading(false);
    }
  };

  const firebaseActive = isFirebaseConfigured();

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        mode === 'signup'
          ? 'Create your JobPing Account'
          : mode === 'signin'
          ? 'Welcome back to JobPing'
          : 'Reset your password'
      }
      subtitle={
        mode === 'signup'
          ? 'Instant Match. Real-Time Alert. Start your job matching and career preparation.'
          : mode === 'signin'
          ? 'Access your saved career profile, real-time alerts, and readiness score.'
          : 'Enter your email to receive password recovery instructions.'
      }
    >
      <div className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Reset success feedback */}
        {resetSent && mode === 'forgot_password' && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              If an account is associated with <span className="font-bold">{email}</span>, password reset instructions have been dispatched.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <InputField
              id="auth-name-input"
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
          )}

          <InputField
            id="auth-email-input"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {mode !== 'forgot_password' && (
            <div>
              <InputField
                id="auth-password-input"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
                helperText={mode === 'signup' ? 'Must be at least 6 characters' : undefined}
              />
              {mode === 'signin' && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <PrimaryButton
              id="auth-submit-btn"
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              {mode === 'signup'
                ? 'Create Account'
                : mode === 'signin'
                ? 'Sign In'
                : 'Send Reset Instructions'}
            </PrimaryButton>
          </div>
        </form>

        {/* Demo Account shortcut */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            id="auth-demo-btn"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Use Sample Demo Account (Rahul Sharma — Fresher)</span>
          </button>
        </div>

        {/* Switch mode footer */}
        <div className="text-center pt-2 text-xs text-slate-600">
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}

          {mode === 'signin' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'forgot_password' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </p>
          )}
        </div>

        {/* Storage / Security indicator */}
        <div className="pt-2 text-center">
          <span className="text-[11px] text-slate-400">
            {firebaseActive
              ? '✓ Connected to Firebase Authentication'
              : '✓ Local Authenticated Storage with PBKDF2/SHA-256 password hashing'}
          </span>
        </div>
      </div>
    </Modal>
  );
};
