// "use client";
// import { useEffect, useState, useContext } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { auth } from "@/firebase.config";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { UserContext } from "@/contexts/UserContext";
// import Link from "next/link";
// import ForgotPassword from "./ForgotPassword";

// function Login({ onSuccess }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const { user } = useContext(UserContext);

//   useEffect(() => {
//     if (!user) return;
//     if (user.type === "pos") {
//       router.push("/pos");
//     } else {
//       router.push("/invoice");
//     }
//   }, [user, router]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMsg("");
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       if (user) {
//         await user.getIdToken(true);
//       }
//     } catch (error) {
//       setErrorMsg("Invalid credentials. Please try again.");
//       toast.error("Invalid credentials. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       {!showForgotPassword && (
//         <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#5DB7DE] via-[#F1E9DB] to-[#EE4B6A]">
//           <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-2">
//             <h2 className="text-3xl font-bold text-center mb-8 text-[#EE4B6A] tracking-tight drop-shadow">
//               Welcome Back
//             </h2>

//             {errorMsg && (
//               <div className="mb-4 text-center text-red-500 font-medium bg-red-50 border border-red-200 rounded p-2">
//                 {errorMsg}
//               </div>
//             )}

//             <form onSubmit={handleLogin} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   autoComplete="username"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between items-center mb-1">
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Password
//                   </label>
//                   <button
//                     type="button"
//                     onClick={() => setShowForgotPassword(true)}
//                     className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//                 <input
//                   type="password"
//                   id="password"
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   autoComplete="current-password"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="btn bg-[#696FC7] text-white px-6 py-3 rounded-full w-full hover:bg-[#585EB5] transition"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Logging in..." : "Log In"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//       {showForgotPassword && (
//         <ForgotPassword
//           setShowForgotPassword={setShowForgotPassword}
//           onSuccess={onSuccess}
//         />
//       )}
//     </>
//   );
// }

// export default Login;

"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { auth } from "@/firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { UserContext } from "@/contexts/UserContext";
import { FiLock, FiMail, FiArrowRight, FiShield } from "react-icons/fi";
import ForgotPassword from "./ForgotPassword";
import authFetch from "@/lib/authFetch";

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useContext(UserContext);

  // Redirect only if already logged in (not during an active login attempt)
  useEffect(() => {
    if (!user || isLoading) return;
    if (user.type === "pos" || user.type === "restaurants" || user.type === "hotel") {
      router.push("/pos");
    } else {
      router.push("/invoice");
    }
  }, [user, router, isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    // Clear old session ID to prevent race condition with UserContext
    localStorage.removeItem("activeSessionId");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredential.user) {
        const token = await userCredential.user.getIdToken(true);
        
        // --- DEVICE LOCKING ---
        const activeSessionId = window.crypto?.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();
        
        // 1. Update Firestore FIRST
        await authFetch("/api/user/update-session", {
          method: "POST",
          body: JSON.stringify({ activeSessionId })
        }, token);

        // 2. Set LocalStorage SECOND
        localStorage.setItem("activeSessionId", activeSessionId);

        // 3. Success toast
        toast.success("Identity Verified. Accessing system...");
      }
    } catch (error) {
      setErrorMsg("INVALID CREDENTIALS");
      toast.error("Access Denied: Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!showForgotPassword && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="w-full max-w-md relative">
            {/* Decorative Background Element */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl" />

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 relative overflow-hidden">
              {/* Top Branding */}
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none italic">
                  SWIFT<span className="text-brand-pink">GST</span>
                </h2>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.4em] uppercase mt-2">
                  Secure Access Portal
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 text-[10px] font-black tracking-widest text-center text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 p-3 rounded-xl animate-shake">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Operator Email
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all dark:text-white"
                      placeholder="name@enterprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Secret Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[10px] font-black text-gray-300 hover:text-brand-pink uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all dark:text-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 dark:bg-brand-pink text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-pink-500/10 mt-4 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    "Authenticating..."
                  ) : (
                    <>
                      Authorize Entry <FiArrowRight strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {showForgotPassword && (
        <ForgotPassword
          setShowForgotPassword={setShowForgotPassword}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

export default Login;
