'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to reset password', {
          description: 'Please try again or request a new reset link',
        });
        return;
      }

      setIsSuccess(true);
      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-card-hover border border-border p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <AppLogo size={40} />
              <span className="font-bold text-foreground text-2xl tracking-tight">HHS Welfare</span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Invalid or Expired Link</h2>
              <p className="text-muted-foreground text-sm">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>

            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
            >
              <span>Request New Reset Link</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card-hover border border-border p-8">
        {!isSuccess ? (
          <>
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <AppLogo size={40} />
              <span className="font-bold text-foreground text-2xl tracking-tight">HHS Welfare</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-1">Reset Password</h2>
              <p className="text-muted-foreground text-sm">
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      validate: {
                        hasUpperCase: (value) =>
                          /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                        hasLowerCase: (value) =>
                          /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                        hasNumber: (value) =>
                          /[0-9]/.test(value) || 'Password must contain at least one number',
                        hasSpecialChar: (value) =>
                          /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                          'Password must contain at least one special character',
                      },
                    })}
                    className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      errors.password
                        ? 'border-red-400 bg-red-50 focus:border-red-400'
                        : 'border-border bg-white focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50 focus:border-red-400'
                        : 'border-border bg-white focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push('/login-screen')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-8">
                <AppLogo size={40} />
                <span className="font-bold text-foreground text-2xl tracking-tight">HHS Welfare</span>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle size={64} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Password Reset Successful</h2>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>

              <button
                onClick={() => router.push('/login-screen')}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
              >
                <span>Go to Login</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}