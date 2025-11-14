'use client'

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, CheckCircle2 } from 'lucide-react';
import { getGoogleOAuthUrl, getMicrosoftOAuthUrl } from '@/lib/auth-api';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    terms_accepted: false
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

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleOAuthUrl();
  };

  const handleMicrosoftLogin = () => {
    window.location.href = getMicrosoftOAuthUrl();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (formData.email && formData.password && formData.terms_accepted) {
        setSuccess(true);
      } else {
        setError('Please fill in all required fields');
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
              We've sent a verification link to your email address. Please click the link to verify your account and get started.
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1dcba] via-[#fef8e8] to-[#f1dcba] px-4 py-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6953a3]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f4e403]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#6953a3]/15 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Signup Card */}
      <div className="max-w-md w-full relative">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border border-[#f1dcba]/30 transform transition-all duration-300 hover:shadow-3xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6953a3] to-[#8b7bb8] rounded-lg flex items-center justify-center transform transition-transform duration-300 hover:scale-110 hover:rotate-6 shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f4e403] rounded-full border-2 border-white animate-pulse shadow-md"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-0.5 bg-gradient-to-r from-[#6953a3] via-[#8b7bb8] to-[#6953a3] bg-clip-text text-transparent animate-gradient">
              Create Account
            </h1>
            <p className="text-gray-600 text-xs font-medium">Sign up to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
              <p className="text-red-700 text-xs font-medium flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('first_name')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('last_name')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#6953a3] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'confirm_password' ? 'text-[#6953a3]' : 'text-gray-400'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirm_password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-[#6953a3]/20 focus:border-[#6953a3] transition-all duration-200 bg-[#f1dcba]/10 focus:bg-white text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#6953a3] transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start group cursor-pointer">
                <input
                  name="terms_accepted"
                  type="checkbox"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#6953a3] focus:ring-2 focus:ring-[#6953a3]/50 cursor-pointer transition-all duration-200"
                />
                <span className="ml-1.5 text-xs text-gray-600 group-hover:text-[#6953a3] transition-colors duration-200">
                  I agree to the{' '}
                  <a href="/terms" className="text-[#6953a3] hover:text-[#8b7bb8] font-semibold hover:underline">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6953a3] to-[#8b7bb8] text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 relative overflow-hidden group text-sm"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b7bb8] to-[#6953a3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Divider */}
          <div className="mt-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#f1dcba]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/90 text-gray-500 font-semibold">Or continue with</span>
              </div>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative inline-flex justify-center items-center py-2 px-2.5 border-2 border-[#f1dcba] rounded-lg shadow-sm bg-white text-xs font-semibold text-gray-700 hover:bg-[#f1dcba]/20 hover:border-[#6953a3]/30 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-1.5 text-xs">Google</span>
            </button>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="group relative inline-flex justify-center items-center py-2 px-2.5 border-2 border-[#f1dcba] rounded-lg shadow-sm bg-white text-xs font-semibold text-gray-700 hover:bg-[#f1dcba]/20 hover:border-[#6953a3]/30 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path d="M0 0h11.377v11.372H0z" fill="#f25022"/>
                <path d="M12.623 0H24v11.372H12.623z" fill="#00a4ef"/>
                <path d="M0 12.628h11.377V24H0z" fill="#7fba00"/>
                <path d="M12.623 12.628H24V24H12.623z" fill="#ffb900"/>
              </svg>
              <span className="ml-1.5 text-xs">Microsoft</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-4 text-center text-xs text-gray-600">
            Already have an account?{' '}
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