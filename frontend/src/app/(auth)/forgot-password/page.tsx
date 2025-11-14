'use client'

import { useState } from 'react';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (email) {
        setSuccess(true);
      } else {
        setError('Please enter your email address');
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1dcba] via-[#fef8e8] to-[#f1dcba] px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6953a3]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f4e403]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-md w-full relative">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-[#f1dcba]/30">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg animate-bounce-slow">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6953a3] to-[#8b7bb8] bg-clip-text text-transparent mb-3">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              If an account exists with that email, we've sent a password reset link. Please check your inbox and follow the instructions.
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-[#6953a3] to-[#8b7bb8] text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Back to Login
            </a>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1dcba] via-[#fef8e8] to-[#f1dcba] px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6953a3]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f4e403]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#6953a3]/15 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="max-w-md w-full relative">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-[#f1dcba]/30 transform transition-all duration-300 hover:shadow-3xl">
          {/* Back Button */}
          <a
            href="/login"
            className="inline-flex items-center text-sm text-[#6953a3] hover:text-[#8b7bb8] font-semibold mb-4 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Login
          </a>

          {/* Logo/Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6953a3] to-[#8b7bb8] rounded-xl flex items-center justify-center transform transition-transform duration-300 hover:scale-110 hover:rotate-6 shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f4e403] rounded-full border-2 border-white animate-pulse shadow-md"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#6953a3] via-[#8b7bb8] to-[#6953a3] bg-clip-text text-transparent animate-gradient">
              Forgot Password
            </h1>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
              <p className="text-red-700 text-sm font-medium flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Email Field */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6953a3] to-[#8b7bb8] text-white py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 relative overflow-hidden group text-sm"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b7bb8] to-[#6953a3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-[#f1dcba]/20 rounded-lg border border-[#f1dcba]">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <span className="font-semibold text-[#6953a3]">💡 Tip:</span> Check your spam folder if you don't see the email within a few minutes
            </p>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#6953a3] hover:text-[#8b7bb8] font-bold hover:underline transition-all duration-200">
              Sign up for free
            </a>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#6953a3] to-[#8b7bb8] rounded-full filter blur-2xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#f4e403] rounded-full filter blur-2xl opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(105, 83, 163, 0.15);
        }
      `}</style>
    </div>
  );
}