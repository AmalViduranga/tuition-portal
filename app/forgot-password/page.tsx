"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { forgotPassword } from "./actions";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const emailFromQuery = searchParams.get("email") || "";
  const errorFromQuery = searchParams.get("error");

  const [email, setEmail] = useState(emailFromQuery);
  const [error, setError] = useState<string | null>(errorFromQuery);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      // This will redirect, so we won't get a response
      await forgotPassword(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  // If success query param is set, show success message
  if (success && emailFromQuery) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-semibold text-slate-900">Check Your Email</h1>
          <p className="mt-4 text-sm text-slate-600">
            We've sent a password reset link to <strong>{decodeURIComponent(emailFromQuery)}</strong>.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="your.email@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <a href="/login" className="text-indigo-600 hover:text-indigo-700">
          Back to Login
        </a>
      </p>
    </div>
  );
}
