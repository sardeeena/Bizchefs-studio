'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-[#fafafa] dark:bg-[#0c0e12]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-[#151921] border border-neutral-200 dark:border-neutral-800 shadow-sm p-1.5 mb-3">
            <Image
              src="/BizChefs-emblem-transparent.png"
              alt="BizChefs"
              width={36}
              height={36}
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/BizChefs-emblem-dark.png"
              alt="BizChefs"
              width={36}
              height={36}
              className="object-contain hidden dark:block"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Reset Portal Access
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enter your registered client email to receive secure recovery instructions.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Check your inbox
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a cryptographic password reset link has been dispatched with a 15-minute expiry token.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
