'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface ChangePasswordFormData {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  useEffect(() => {
    // Check if this is a first login (forced password change)
    const searchParams = new URLSearchParams(window.location.search);
    setIsFirstLogin(searchParams.get('first') === 'true');
  }, []);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to change password', {
          description: 'Please check your current password and try again',
        });
        return;
      }

      setIsSuccess(true);
      toast.success('Password changed successfully!', {
        description: isFirstLogin ? 'You can now access your account' : 'Your password has been updated',
      });

      // Redirect after a short delay
      setTimeout(() => {
        if (isFirstLogin) {
          router.push('/member-dashboard');
        } else {
          router.push('/member-dashboard/settings');
        }
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* First login warning */}
            {isFirstLogin && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-amber-600 mt-0.5" size={18} />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800">First Login</h3>
                    <p className="text-xs text-amber-700 mt-1">
                      You must change your password before accessing your account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {isFirstLogin ? 'Set Your Password' : 'Change Password'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isFirstLogin 
                  ? 'Create a strong password for your account' 
                  : 'Enter your current password and choose a new one'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Current Password (only for non-first login) */}
              {!isFirstLogin && (
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-foreground mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      {...register('currentPassword', {
                        required: 'Current password is required',
                      })}
                      className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        errors.currentPassword
                          ? 'border-red-400 bg-red-50 focus:border-red-400'
                          : 'border-border bg-white focus:border-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.currentPassword.message}</p>
                  )}
                </div>
              )}

              {/* New Password */}
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

              {/* Confirm New Password */}
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>{isFirstLogin ? 'Set Password' : 'Change Password'}</span>
                )}
              </button>
            </form>

            {/* Skip button for first login */}
            {isFirstLogin && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/logout')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log out and try again later
                </button>
              </div>
            )}
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated!</h2>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully changed.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <p className="text-xs text-green-800">
                  You will be redirected to your dashboard shortly...
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}