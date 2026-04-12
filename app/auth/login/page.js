// app/auth/login/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  HomeIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user?.role;
      switch (role) {
        case 'tenant':   window.location.href = '/tenant/dashboard'; break;
        case 'landlord': window.location.href = '/landlord/dashboard'; break;
        case 'investor': window.location.href = '/investor/dashboard'; break;
        case 'admin':    window.location.href = '/admin/dashboard'; break;
        default:         window.location.href = '/'; break;
      }
    } else {
      setError(result.error || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="rw-auth-page">
      {/* Background */}
      <div className="rw-auth-bg">
        <img src="/images/sky.jpg" alt="" className="rw-auth-bg__img" />
        <div className="rw-auth-bg__overlay" />
      </div>

      {/* Content */}
      <div className="rw-auth-container">
        <div className="rw-auth-card">
          
          {/* Logo */}
          <Link href="/" className="rw-auth-logo">
            <div className="rw-auth-logo__mark">
              <HomeIcon className="rw-logo__icon" />
            </div>
            <span className="rw-auth-logo__text">
              Rent<span>BW</span>
            </span>
          </Link>

          {/* Header */}
          <div className="rw-auth-header">
            <h1 className="rw-auth-header__title">Welcome back</h1>
            <p className="rw-auth-header__subtitle">
              Don't have an account?{' '}
              <Link href="/auth/register" className="rw-auth-header__link">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="rw-demo-card">
            <div className="rw-demo-card__header">
              <span className="rw-demo-card__label">Demo Credentials</span>
            </div>
            <div className="rw-demo-card__grid">
              <div className="rw-demo-card__item">
                <span className="rw-demo-card__role">Tenant</span>
                <span className="rw-demo-card__email">tenant@rentbw.com</span>
              </div>
              <div className="rw-demo-card__item">
                <span className="rw-demo-card__role">Landlord</span>
                <span className="rw-demo-card__email">landlord@rentbw.com</span>
              </div>
              <div className="rw-demo-card__item">
                <span className="rw-demo-card__role">Investor</span>
                <span className="rw-demo-card__email">investor@rentbw.com</span>
              </div>
              <div className="rw-demo-card__item">
                <span className="rw-demo-card__role">Admin</span>
                <span className="rw-demo-card__email">admin@rentbw.com</span>
              </div>
            </div>
            <p className="rw-demo-card__password">
              <ShieldCheckIcon className="rw-demo-card__password-icon" />
              Password: <strong>password123</strong>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rw-error">
              <span className="rw-error__icon">!</span>
              <p className="rw-error__text">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="rw-auth-form" onSubmit={handleSubmit}>
            <div className="rw-form-group">
              <label htmlFor="email" className="rw-form-label">
                Email address
              </label>
              <div className="rw-form-field">
                <EnvelopeIcon className="rw-form-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="rw-form-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="rw-form-group">
              <label htmlFor="password" className="rw-form-label">
                Password
              </label>
              <div className="rw-form-field">
                <LockClosedIcon className="rw-form-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="rw-form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rw-form-toggle"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="rw-form-toggle__icon" />
                  ) : (
                    <EyeIcon className="rw-form-toggle__icon" />
                  )}
                </button>
              </div>
            </div>

            <div className="rw-form-footer">
              <Link href="/auth/forgot-password" className="rw-forgot-link">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="rw-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="rw-submit-btn__spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="rw-submit-btn__icon" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        /* Auth Page */
        .rw-auth-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* Background */
        .rw-auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }
        .rw-auth-bg__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.7) saturate(0.9);
        }
        .rw-auth-bg__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(14, 14, 14, 0.4) 0%,
            rgba(14, 14, 14, 0.8) 100%
          );
        }

        /* Container */
        .rw-auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        /* Card */
        .rw-auth-card {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 40px 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .rw-auth-card {
            padding: 32px 24px;
          }
        }

        /* Logo */
        .rw-auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 32px;
        }
        .rw-auth-logo__mark {
          width: 44px;
          height: 44px;
          background: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rw-auth-logo__icon {
          font-size: 24px;
        }
        .rw-auth-logo__text {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .rw-auth-logo__text span {
          color: var(--accent);
        }

        /* Header */
        .rw-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .rw-auth-header__title {
          font-family: var(--ff-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .rw-auth-header__subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }
        .rw-auth-header__link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .rw-auth-header__link:hover {
          color: var(--accent-dark);
          text-decoration: underline;
        }

        /* Demo Card */
        .rw-demo-card {
          background: rgba(200, 169, 110, 0.08);
          border: 1px solid rgba(200, 169, 110, 0.2);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .rw-demo-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(200, 169, 110, 0.15);
        }
        .rw-demo-card__icon {
          width: 18px;
          height: 18px;
          color: var(--accent);
        }
        .rw-demo-card__label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .rw-demo-card__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .rw-demo-card__item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rw-demo-card__role {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
        }
        .rw-demo-card__email {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
        }
        .rw-demo-card__password {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          padding-top: 12px;
          border-top: 1px solid rgba(200, 169, 110, 0.15);
        }
        .rw-demo-card__password-icon {
          width: 14px;
          height: 14px;
          color: #10b981;
        }
        .rw-demo-card__password strong {
          color: var(--ink);
          font-weight: 600;
        }

        /* Error */
        .rw-error {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 24px;
        }
        .rw-error__icon {
          width: 24px;
          height: 24px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
        }
        .rw-error__text {
          font-size: 13px;
          color: #dc2626;
          flex: 1;
        }

        /* Form */
        .rw-auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .rw-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rw-form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .rw-form-field {
          position: relative;
        }
        .rw-form-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .rw-form-input {
          width: 100%;
          padding: 14px 16px 14px 46px;
          font-size: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          background: var(--white);
          transition: all 0.2s;
          font-family: inherit;
        }
        .rw-form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(200, 169, 110, 0.1);
        }
        .rw-form-input::placeholder {
          color: #aaa;
        }
        .rw-form-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .rw-form-toggle:hover {
          color: var(--accent);
        }
        .rw-form-toggle__icon {
          width: 18px;
          height: 18px;
        }

        /* Form Footer */
        .rw-form-footer {
          text-align: right;
        }
        .rw-forgot-link {
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          transition: color 0.2s;
        }
        .rw-forgot-link:hover {
          color: var(--accent-dark);
          text-decoration: underline;
        }

        /* Submit Button */
        .rw-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .rw-submit-btn:hover:not(:disabled) {
          background: var(--accent);
          transform: translateY(-1px);
        }
        .rw-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rw-submit-btn__spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        .rw-submit-btn__icon {
          width: 16px;
          height: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}