'use client'

import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [focusedField, setFocusedField] = useState('');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-[#f4e403]' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (formData.new_password && formData.confirm_password) {
        if (formData.new_password === formData.confirm_password) {
          setSuccess(true);
          // Simulate redirect after 3 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else {
          setError('Passwords do not match');
        }
      } else {
        setError('Please fill in all fields');
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
              Password Reset Successful
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your password has been reset successfully. Redirecting you to login...
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-[#6953a3] to-[#8b7bb8] text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to Login
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

      {/* Reset Password Card */}
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
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f4e403] rounded-full border-2 border-white animate-pulse shadow-md"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#6953a3] via-[#8b7bb8] to-[#6953a3] bg-clip-text text-transparent animate-gradient">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Enter your new password to secure your account
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
          <div className="space-y-4">
            {/* New Password Field */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'new_password' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('new_password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6953a3] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'confirm_password' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirm_password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#6953a3] transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-[#f1dcba]/20 rounded-lg border border-[#f1dcba]">
              <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`mr-2 ${formData.new_password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                    {formData.new_password.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/[A-Z]/.test(formData.new_password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(formData.new_password) ? '✓' : '○'}
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/[0-9]/.test(formData.new_password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[0-9]/.test(formData.new_password) ? '✓' : '○'}
                  </span>
                  One number
                </li>
              </ul>
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b7bb8] to-[#6953a3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-[#6953a3] hover:text-[#8b7bb8] font-bold hover:underline transition-all duration-200">
              Sign in
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