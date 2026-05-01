'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { setUserOnly, getRedirectPath } from '@/lib/auth-client';
import { useUser } from '@/lib/user-context';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser: setContextUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Login failed', {
          description: 'Please check your credentials and try again',
        });
        return;
      }

      toast.success('Login successful!', {
        description: `Welcome back, ${result.user.role === 'ADMIN' ? 'Admin' : 'Member'}!`,
      });

      setContextUser(result.user);

      // Check if user must change password (first login)
      if (result.user.mustChangePassword) {
        setTimeout(() => router.push('/change-password?first=true'), 500);
      } else {
        const redirectPath = getRedirectPath(result.user.role);
        setTimeout(() => router.push(redirectPath), 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card-hover border border-border p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <AppLogo size={40} />
          <span className="font-bold text-foreground text-2xl tracking-tight">HHS Welfare</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Sign In</h2>
          <p className="text-muted-foreground text-sm">
            Sign in to access the Harambee House Staff Welfare portal
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

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.password
                    ? 'border-red-400 bg-red-50 focus:border-red-400'
                    : 'border-border bg-white focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary font-medium hover:text-primary-dark transition-colors"
            >
              Forgot password?
            </button>
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Not a member?{' '}
            <a
              href="/member-registration-wizard"
              className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center gap-1"
            >
              <UserPlus size={14} />
              Register as a Member
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
