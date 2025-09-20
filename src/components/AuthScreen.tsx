// src/components/AuthScreen.tsx
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const friendlyError = (code: string | undefined) => {
  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/email-already-in-use":
      return "This email is already in use. Try logging in.";
    case "auth/weak-password":
      return "Password too weak. Use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup closed. Try again.";
    case "auth/cancelled-popup-request":
      return "Google sign-in cancelled.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 6000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  useEffect(() => {
    if (!infoMsg) return;
    const t = setTimeout(() => setInfoMsg(null), 5000);
    return () => clearTimeout(t);
  }, [infoMsg]);

  const handleEmailAuth = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      let cred: UserCredential;
      if (isRegister) {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        setInfoMsg(`Account created — welcome, ${cred.user.email}`);
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
        setInfoMsg(`Logged in as ${cred.user.email}`);
      }
      // Do not manually redirect — App listens to auth state and will update view.
    } catch (err: any) {
      setErrorMsg(friendlyError(err?.code));
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // App auth listener will handle UI change
    } catch (err: any) {
      setErrorMsg(friendlyError(err?.code));
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg("Enter the email you used to register.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfoMsg("If an account exists, a reset email has been sent.");
    } catch (err: any) {
      setErrorMsg(friendlyError(err?.code));
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isRegister ? "Create account" : "Welcome back"}
        </h2>

        {errorMsg && (
          <div className="mb-3 text-sm text-white bg-red-500 px-3 py-2 rounded">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="mb-3 text-sm text-white bg-green-500 px-3 py-2 rounded">
            {infoMsg}
          </div>
        )}

        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="w-full mt-1 mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="email"
        />

        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full mt-1 mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="password"
          />
          <button
            onClick={() => setShowPassword((s) => !s)}
            className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            aria-pressed={showPassword}
            type="button"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            {isRegister ? "Create a new account" : "Sign in to continue"}
          </div>
          <div className="text-sm">
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full py-2 mb-3 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span>{isRegister ? "Creating account..." : "Signing in..."}</span>
            </span>
          ) : (
            <span>{isRegister ? "Register" : "Login"}</span>
          )}
        </button>

        <div className="flex items-center justify-center mb-3">
          <div className="h-px bg-gray-200 flex-1"></div>
          <div className="px-3 text-sm text-gray-500">or</div>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2 mb-2 rounded border flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="h-5 w-5"
          />
          <span>Continue with Google</span>
        </button>

        <div className="text-center mt-4 text-sm">
          <button
            onClick={() => {
              setIsRegister((r) => !r);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
