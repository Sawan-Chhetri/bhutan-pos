"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { auth } from "@/firebase.config";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { UserContext } from "@/contexts/UserContext";
import Link from "next/link";
// import ForgotPassword from "./ForgotPassword";

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, loading: userLoading } = useContext(UserContext);

  useEffect(() => {
    if (userLoading) return; // still loading, do nothing
    if (user) {
      router.replace("/pos"); // Redirect to home or appropriate page
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        // Get the ID token result which includes custom claims (roles)
        const tokenResult = await user.getIdTokenResult();
      }
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!showForgotPassword && (
        <div className="min-h-80 md:min-h-96 flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

            {/* User Type Toggle */}
            <div className="flex justify-between mb-6"></div>

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="text-center">
                    <a
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>

                <input
                  type="password"
                  id="password"
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                // className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
                className="btn bg-[#696FC7] text-white px-6 py-3 rounded-full w-full hover:bg-[#585EB5] transition"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      )}
      {/* {showForgotPassword && (
        <ForgotPassword
          setShowForgotPassword={setShowForgotPassword}
          onSuccess={onSuccess}
        /> // Render the Forgot Password component
      )} */}
    </>
  );
}

export default Login;
