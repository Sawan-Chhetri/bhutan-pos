// "use client";
// import { useState } from "react";
// import { toast } from "react-toastify";

// export default function ForgotPassword({ setShowForgotPassword, onSuccess }) {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [sent, setSent] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     try {
//       const res = await fetch("/api/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to send reset email");
//       setSent(true);
//       toast.success("Password reset email sent!");
//       if (onSuccess) onSuccess();
//     } catch (err) {
//       setError(err.message || "Failed to send reset email");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#5DB7DE] via-[#F1E9DB] to-[#EE4B6A]">
//       <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-2">
//         <h2 className="text-2xl font-bold text-center mb-6 text-[#5DB7DE]">
//           Reset Password
//         </h2>
//         {sent ? (
//           <div className="text-green-600 text-center font-medium mb-4">
//             If an account exists for <span className="font-mono">{email}</span>,
//             a reset link has been sent.
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="reset-email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="reset-email"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue bg-brand-blue-light text-brand-blue"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 autoComplete="username"
//               />
//             </div>
//             {error && (
//               <div className="text-red-500 text-center font-medium">
//                 {error}
//               </div>
//             )}
//             <button
//               type="submit"
//               className="w-full py-3 bg-linear-to-r from-[#5DB7DE] to-[#EE4B6A] text-white font-bold rounded-full shadow-lg hover:from-[#EE4B6A] hover:to-[#5DB7DE] transition text-lg disabled:opacity-60"
//               disabled={isLoading}
//             >
//               {isLoading ? "Sending..." : "Send Reset Link"}
//             </button>
//             <button
//               type="button"
//               className="w-full mt-2 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
//               onClick={() => setShowForgotPassword(false)}
//             >
//               Back to Login
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiMail, FiArrowLeft, FiSend, FiKey } from "react-icons/fi";

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
      toast.success("Recovery link dispatched.");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("RECOVERY FAILED: VERIFY EMAIL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl" />

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 relative overflow-hidden">
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
              Account <span className="text-brand-pink">Recovery</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.4em] uppercase mt-2">
              Credential Reset
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 p-6 rounded-2xl">
                <p className="text-[11px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest leading-relaxed">
                  Recovery link has been dispatched to:
                  <br />
                  <span className="text-gray-900 dark:text-white font-mono lowercase mt-2 block italic text-xs">
                    {email}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-[10px] font-black text-gray-400 hover:text-brand-pink uppercase tracking-widest transition-colors flex items-center justify-center w-full gap-2"
              >
                <FiArrowLeft /> Return to Portal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Registered Email
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all dark:text-white"
                    placeholder="operator@enterprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-[10px] font-black tracking-widest text-center text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 dark:bg-brand-pink text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-pink-500/10 disabled:opacity-50"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Send Reset Link <FiSend />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors"
                >
                  Cancel & Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
