'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return <p className="text-red-600">Invalid reset link. Please request a new one.</p>;
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
        <p className="text-slate-600">You can now log in with your new password.</p>
        <Link href="/auth/login" className="mt-4 inline-block text-primary font-bold">Go to Login →</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700">New Password</label>
        <div className="mt-1 relative">
          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPassword ? <EyeSlashIcon className="w-5 h-5 text-slate-400" /> : <EyeIcon className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
        <div className="mt-1 relative">
          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="pl-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link href="/" className="flex items-center justify-center gap-2 text-primary mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg"></div>
          <span className="text-2xl font-bold">RentBW</span>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-6">Create new password</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}