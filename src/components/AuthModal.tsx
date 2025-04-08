import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Github, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`relative w-full max-w-md rounded-lg shadow-lg ${
        isDark ? 'bg-[#0f1318] border border-[#00ff9540]' : 'bg-white'
      } p-6`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg ${
            isDark
              ? 'hover:bg-[#00ff9520] text-[#00ff95]'
              : 'hover:bg-emerald-100 text-emerald-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${
          isDark ? 'text-[#00ff95]' : 'text-emerald-600'
        }`}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <div className="space-y-4 mb-6">
          <button
            onClick={handleGoogleSignIn}
            className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            } transition-colors`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGithubSignIn}
            className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            } transition-colors`}
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                isDark ? 'border-white/20' : 'border-gray-200'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${
                isDark ? 'bg-[#0f1318] text-white/60' : 'bg-white text-gray-500'
              }`}>Or continue with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              } mb-1`}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-[#0a0c10] border-[#00ff9540] text-gray-200'
                  : 'bg-white border-emerald-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              } mb-1`}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-[#0a0c10] border-[#00ff9540] text-gray-200'
                  : 'bg-white border-emerald-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-[#00ff95] hover:bg-[#00ff95]/90 text-black'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } transition-colors disabled:opacity-50`}
          >
            <Mail className="w-5 h-5" />
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className={`w-full text-sm ${
              isDark ? 'text-[#00ff95]' : 'text-emerald-600'
            } hover:underline`}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}