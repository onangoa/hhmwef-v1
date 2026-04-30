'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Request failed', {
          description: 'Please check your email and try again',
        });
        return;
      }

      setIsSuccess(true);
      setSubmittedEmail(data.email);
      toast.success('Password reset email sent!', {
        description: 'Please check your inbox for instructions',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-1">Forgot Password?</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we'll send you instructions to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@memberreg.go.ke"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      errors.email
                        ? 'border-red-400 bg-red-50 focus:border-red-400'
                        : 'border-border bg-white focus:border-primary'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email.message}</p>
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight size={16} />
                  </>
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                <p className="text-muted-foreground text-sm">
                  We've sent password reset instructions to{' '}
                  <span className="font-semibold text-foreground">{submittedEmail}</span>
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-xs text-blue-800">
                  Didn't receive the email? Check your spam folder or try again later.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/login-screen')}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
