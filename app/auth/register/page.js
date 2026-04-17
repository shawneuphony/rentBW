// app/auth/register/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Account Info
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Role Selection
    role: '',
    
    // Additional Info based on role (not used in MVP backend, but kept for future)
    monthlyBudget: '',
    preferredLocations: [],
    companyName: '',
    businessReg: '',
    investmentBudget: '',
    investorType: '',
    
    // Terms
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = 'Please select a role';
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationToggle = (location) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(l => l !== location)
        : [...prev.preferredLocations, location]
    }));
  };

  const handleNext = () => {
    let stepErrors = {};
    if (step === 1) stepErrors = validateStep1();
    else if (step === 2) stepErrors = validateStep2();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const step3Errors = validateStep3();
    if (Object.keys(step3Errors).length > 0) {
      setErrors(step3Errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Call the real registration API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Registration successful – cookie already set by API
      // Redirect to the appropriate dashboard based on role
      switch (formData.role) {
        case 'tenant':
          router.push('/tenant/dashboard');
          break;
        case 'landlord':
          router.push('/landlord/dashboard');
          break;
        case 'investor':
          router.push('/investor/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const locations = [
    'Phakalane', 'Broadhurst', 'Block 8', 'CBD',
    'G-West', 'Tlokweng', 'Kgale View', 'Phase 2'
  ];

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-primary mb-8">
          <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-3xl">home_work</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">RentBW</h1>
        </Link>
        <h2 className="text-center text-3xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-primary/10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    s === step ? 'bg-primary text-white' :
                    s < step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s < step ? <CheckBadgeIcon className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      s < step ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Account</span>
              <span>Role</span>
              <span>Review</span>
            </div>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="mt-1 relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <div className="mt-1 relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="mt-1 relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="+267 71 234 567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-slate-400" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-slate-400" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    I want to join as a:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['tenant', 'landlord', 'investor'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role }))}
                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                          formData.role === role
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary/30'
                        }`}
                      >
                        <div className="text-3xl mb-2">
                          {role === 'tenant' && '👤'}
                          {role === 'landlord' && '🏠'}
                          {role === 'investor' && '📈'}
                        </div>
                        <p className="text-sm font-bold capitalize">{role}</p>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p className="mt-2 text-xs text-red-600">{errors.role}</p>}
                </div>

                {/* Role‑specific optional fields (stored for future use, not required for MVP) */}
                {formData.role === 'tenant' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Monthly Budget (BWP)</label>
                      <input
                        type="number"
                        name="monthlyBudget"
                        value={formData.monthlyBudget}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="e.g., 5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Locations</label>
                      <div className="grid grid-cols-2 gap-2">
                        {locations.map(loc => (
                          <label key={loc} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.preferredLocations.includes(loc)}
                              onChange={() => handleLocationToggle(loc)}
                              className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'landlord' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Company Name (Optional)</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="e.g., Wilson Properties"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Business Registration Number</label>
                      <input
                        type="text"
                        name="businessReg"
                        value={formData.businessReg}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="e.g., BW-12345-2024"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'investor' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Investment Budget (BWP)</label>
                      <input
                        type="number"
                        name="investmentBudget"
                        value={formData.investmentBudget}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="e.g., 1000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Investor Type</label>
                      <select
                        name="investorType"
                        value={formData.investorType}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg"
                      >
                        <option value="">Select type</option>
                        <option value="individual">Individual</option>
                        <option value="institutional">Institutional</option>
                        <option value="fund">Investment Fund</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Terms */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Account Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Name:</dt><dd className="font-medium">{formData.fullName}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Email:</dt><dd className="font-medium">{formData.email}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Phone:</dt><dd className="font-medium">{formData.phone}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Role:</dt><dd className="font-medium capitalize">{formData.role}</dd></div>
                  </dl>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms}</p>}

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-600">
                      I want to receive email updates about properties and promotions
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}