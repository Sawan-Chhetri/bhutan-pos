"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { auth } from "@/firebase.config";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { UserContext } from "@/contexts/UserContext";
import Link from "next/link";
import ForgotPassword from "./ForgotPassword";

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) return;
    if (user.type === "pos") {
      router.push("/pos");
    } else {
      router.push("/invoice");
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        await user.getIdToken(true);
      }
    } catch (error) {
      setErrorMsg("Invalid credentials. Please try again.");
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!showForgotPassword && (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#5DB7DE] via-[#F1E9DB] to-[#EE4B6A]">
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-2">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#EE4B6A] tracking-tight drop-shadow">
              Welcome Back
            </h2>

            {errorMsg && (
              <div className="mb-4 text-center text-red-500 font-medium bg-red-50 border border-red-200 rounded p-2">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn bg-[#696FC7] text-white px-6 py-3 rounded-full w-full hover:bg-[#585EB5] transition"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
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
