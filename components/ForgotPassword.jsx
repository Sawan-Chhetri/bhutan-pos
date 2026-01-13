"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword({ setShowForgotPassword, onSuccess }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");
      setSent(true);
      toast.success("Password reset email sent!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5DB7DE] via-[#F1E9DB] to-[#EE4B6A]">
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-2">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#5DB7DE]">
          Reset Password
        </h2>
        {sent ? (
          <div className="text-green-600 text-center font-medium mb-4">
            If an account exists for <span className="font-mono">{email}</span>,
            a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="reset-email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue bg-brand-blue-light text-brand-blue"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            {error && (
              <div className="text-red-500 text-center font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#5DB7DE] to-[#EE4B6A] text-white font-bold rounded-full shadow-lg hover:from-[#EE4B6A] hover:to-[#5DB7DE] transition text-lg disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              className="w-full mt-2 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
